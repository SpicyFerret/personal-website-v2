#!/bin/sh
# Bootstraps k3s on two Raspberry Pi 5s (server + agent) over SSH with password auth.
#
# Runs anywhere with sh + ssh + sshpass. On Windows, use the docker one-liner:
#
#   docker run --rm --env-file pi.env -v "%CD%\scripts:/s" alpine:3.20 sh -c \
#     "apk add -q openssh-client sshpass && SERVER_IP=192.168.100.10 AGENT_IP=192.168.100.11 SSH_USER=zion sh /s/k3s-bootstrap.sh"
#
#   (pi.env contains:  SSHPASS=<password> )
#
# What it does:
#   1. Enables memory cgroups on both Pis (required by k3s on Raspberry Pi OS) + reboots
#   2. Installs k3s server on SERVER_IP (traefik/servicelb disabled — cloudflared handles ingress)
#   3. Joins AGENT_IP as a worker
#   4. Prints the CI-ready kubeconfig (server=https://127.0.0.1:6443 + tls-server-name) as base64
set -eu

: "${SERVER_IP:?set SERVER_IP}"
: "${AGENT_IP:?set AGENT_IP}"
: "${SSH_USER:?set SSH_USER}"
: "${SSHPASS:?set SSHPASS env var (used by sshpass -e)}"

SSH="sshpass -e ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10"

run() { # run <ip> <command>
  $SSH "$SSH_USER@$1" "$2"
}

wait_ssh() { # wait_ssh <ip>
  echo "waiting for ssh on $1..."
  i=0
  while ! $SSH "$SSH_USER@$1" 'true' 2>/dev/null; do
    i=$((i + 1))
    [ "$i" -gt 60 ] && echo "ssh on $1 did not come back" && exit 1
    sleep 5
  done
}

prep_pi() { # prep_pi <ip>
  echo "== preparing $1 (cgroups) =="
  run "$1" '
    CMDLINE=/boot/firmware/cmdline.txt
    [ -f "$CMDLINE" ] || CMDLINE=/boot/cmdline.txt
    if ! grep -q cgroup_enable=memory "$CMDLINE"; then
      sudo sed -i "s/\$/ cgroup_memory=1 cgroup_enable=memory/" "$CMDLINE"
      echo REBOOT_NEEDED
      (sleep 1 && sudo reboot) >/dev/null 2>&1 &
    else
      echo cgroups already enabled
    fi'
}

# --- 1. prep both (parallel reboots) ---
OUT_S=$(prep_pi "$SERVER_IP")
OUT_A=$(prep_pi "$AGENT_IP")
echo "$OUT_S"; echo "$OUT_A"
echo "$OUT_S" | grep -q REBOOT_NEEDED && sleep 10 && wait_ssh "$SERVER_IP"
echo "$OUT_A" | grep -q REBOOT_NEEDED && sleep 10 && wait_ssh "$AGENT_IP"

# --- 2. k3s server ---
echo "== installing k3s server on $SERVER_IP =="
run "$SERVER_IP" '
  if ! command -v k3s >/dev/null; then
    curl -sfL https://get.k3s.io | sudo sh -s - server \
      --disable traefik --disable servicelb \
      --write-kubeconfig-mode 644
  else
    echo k3s already installed
  fi'

TOKEN=$(run "$SERVER_IP" 'sudo cat /var/lib/rancher/k3s/server/node-token')

# --- 3. join agent ---
echo "== joining agent $AGENT_IP =="
run "$AGENT_IP" "
  if ! command -v k3s >/dev/null; then
    curl -sfL https://get.k3s.io | sudo K3S_URL=https://$SERVER_IP:6443 K3S_TOKEN=$TOKEN sh -
  else
    echo k3s agent already installed
  fi"

# --- 4. verify + emit CI kubeconfig ---
echo "== nodes =="
run "$SERVER_IP" 'sudo k3s kubectl get nodes -o wide'

# Label the server node (run this script with SERVER_IP = the Pi with the LARGER disk):
# postgres.yaml pins its PVC there via nodeSelector disk=large.
run "$SERVER_IP" 'sudo k3s kubectl label node "$(hostname)" disk=large --overwrite'

echo "== CI kubeconfig (KUBE_CONFIG secret, base64) =="
run "$SERVER_IP" 'sudo cat /etc/rancher/k3s/k3s.yaml' \
  | sed "s|server: https://127.0.0.1:6443|server: https://127.0.0.1:6443\n    tls-server-name: kubernetes.default.svc|" \
  | base64 | tr -d '\n'
echo
echo "== done =="
