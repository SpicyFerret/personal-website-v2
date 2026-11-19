import { Component, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../core/api.service';

interface Faq {
  q: string;
  a: string;
}

/**
 * Landing B2B de consultoria (pt-BR), destino do anúncio de Meta Ads.
 *
 * Conteúdo fixo no componente (sem CMS) e paleta própria em variáveis de escopo
 * local (`:host`), para não tocar nos tokens globais de `styles.scss`. Fundos e
 * textos das seções claras usam `--pw-*`, então a página acompanha o tema.
 *
 * Regras de conteúdo (não negociáveis): H1 e subtítulo iguais aos do anúncio,
 * um único rótulo de CTA ("Mostrar meu projeto") e prova apenas real.
 */
@Component({
  selector: 'app-consultoria',
  // O `<html lang>` do site é "en"; esta rota é a única em pt-BR, então o
  // idioma é marcado no host em vez de global.
  host: { lang: 'pt-BR' },
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
  ],
  template: `
    <!-- 1. Hero -->
    <section class="hero container" aria-labelledby="hero-title">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Consultoria de desenvolvimento de software · B2B</p>
          <h1 id="hero-title">É possível. <em>Em semanas, não anos.</em></h1>
          <p class="hero-sub">
            Seu sistema parece caro ou demorado demais? Já tirei do papel um projeto parado há 2
            anos, em 1 mês.
          </p>
          <div class="hero-actions">
            <a mat-flat-button class="cta" href="#formulario">{{ ctaLabel }}</a>
            <p class="hero-note muted">
              Você descreve o projeto em 2 linhas. Eu respondo se é possível e em quanto tempo.
            </p>
          </div>
        </div>
        <div class="hero-media">
          <img
            src="/consultoria/hero.webp"
            width="768"
            height="1376"
            fetchpriority="high"
            decoding="async"
            alt="Desenvolvedor trabalhando no sistema de um cliente"
          />
          <p class="badge">
            <small>Caso real</small>
            <strong>2 anos parado → 1 mês no ar</strong>
          </p>
        </div>
      </div>

      <div class="stats">
        <div class="stat card-surface"><b>1 semana</b><span>de levantamento com a diretoria</span></div>
        <div class="stat card-surface"><b>2 semanas</b><span>até a 1ª versão rodando no seu ambiente</span></div>
        <div class="stat card-surface"><b>R$ 0</b><span>antes da entrega, no pagamento na entrega</span></div>
      </div>
    </section>

    <!-- 2. Benefícios -->
    <section class="section alt below" aria-labelledby="beneficios">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">O que muda</p>
          <h2 id="beneficios">Você vê o sistema funcionando antes de decidir</h2>
        </div>
        <div class="cards">
          <article class="card card-surface">
            <p class="num">2 semanas</p>
            <h3>1ª versão no seu ambiente real</h3>
            <p class="muted">
              Nada de apresentação ou protótipo de slide. Você e a sua equipe avaliam o sistema
              rodando.
            </p>
          </article>
          <article class="card card-surface">
            <p class="num">1 semana</p>
            <h3>Requisitos claros, mesmo sem especificação</h3>
            <p class="muted">
              Não precisa chegar com tudo descrito. Levanto com a diretoria o sistema que vocês
              realmente querem, com integrações e automações.
            </p>
          </article>
          <article class="card card-surface">
            <p class="num">R$ 0</p>
            <h3>Antes da entrega</h3>
            <p class="muted">
              No modelo de pagamento na entrega, você paga o tempo acumulado só quando recebe. O
              risco do atraso fica comigo.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- 3. Prova -->
    <section class="section below" aria-labelledby="casos">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Prova</p>
          <h2 id="casos">2 casos reais</h2>
          <p class="muted">Os dois clientes chegaram por indicação. Os nomes ficam preservados.</p>
        </div>
        <div class="cards">
          <article class="card case">
            <span class="tag">Projeto travado</span>
            <p class="num">2 anos → 1 mês</p>
            <p>
              Outra consultoria desenvolvia o sistema havia 2 anos e ainda pedia mais 6 meses.
              Assumi o projeto, mostrei a 1ª versão em 2 semanas e entreguei em 1 mês um escopo
              maior que o original, com as integrações e automações que a diretoria queria.
            </p>
            <p class="case-quote">
              O gestor de TI começou cético e passou a apoiar quando viu as entregas.
            </p>
          </article>
          <article class="card case">
            <span class="tag">Do zero</span>
            <p class="num">3 dias</p>
            <p>
              Sistema de controle de estoque e venda, construído do zero e entregue em 3 dias.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. Como funciona -->
    <section class="section alt below" aria-labelledby="como">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Como funciona</p>
          <h2 id="como">Do primeiro contato à entrega, em 3 passos</h2>
        </div>
        <div class="steps">
          <article class="step card-surface">
            <div class="step-n" aria-hidden="true">1</div>
            <div>
              <p class="when">Semana 1</p>
              <h3>Levantamento com a diretoria</h3>
              <p class="muted">
                Entendo o sistema que vocês imaginam, os dados que já existem e o que precisa
                conversar com o quê.
              </p>
            </div>
          </article>
          <article class="step card-surface">
            <div class="step-n" aria-hidden="true">2</div>
            <div>
              <p class="when">Até a semana 2</p>
              <h3>1ª versão no seu ambiente</h3>
              <p class="muted">
                O sistema roda na nuvem, no seu ambiente. Você e o seu TI testam na prática e
                ajustam a rota.
              </p>
            </div>
          </article>
          <article class="step card-surface">
            <div class="step-n" aria-hidden="true">3</div>
            <div>
              <p class="when">Entrega</p>
              <h3>Sistema no ar</h3>
              <p class="muted">
                Ajustes feitos, sistema entregue. No pagamento na entrega, é só aqui que você paga.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 5. Oferta -->
    <section class="section below" aria-labelledby="oferta">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Oferta</p>
          <h2 id="oferta">O que está incluído</h2>
        </div>
        <div class="offer">
          <ul class="checklist">
            @for (item of included; track item.title) {
              <li>
                <mat-icon aria-hidden="true">check_circle</mat-icon>
                <span><b>{{ item.title }}</b> {{ item.text }}</span>
              </li>
            }
          </ul>
          <div class="not-box">
            <h3>O que eu não faço</h3>
            <p class="muted">Suporte em hardware e redes físicas. Atendo apenas em nuvem (cloud).</p>
            <p class="muted">
              Se o seu projeto depende de servidor próprio, eu te digo isso na 1ª conversa.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Planos -->
    <section class="section alt below" aria-labelledby="planos">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Investimento</p>
          <h2 id="planos">2 jeitos de pagar</h2>
          <p class="muted">O mesmo valor semanal. O que muda é quando você paga.</p>
        </div>
        <div class="plans">
          <article class="plan card-surface">
            <h3>Por semana</h3>
            <p class="price">R$ 5–8 mil <small>/ semana</small></p>
            <p class="muted">
              Negociável conforme o escopo. Você paga e acompanha a evolução semana a semana.
            </p>
            <a mat-flat-button class="cta" href="#formulario">{{ ctaLabel }}</a>
          </article>
          <article class="plan card-surface featured">
            <span class="ribbon">Risco comigo</span>
            <h3>Pagamento na entrega</h3>
            <p class="price">R$ 0 <small>até a entrega</small></p>
            <p class="muted">
              O valor semanal é somado e pago de uma vez, só quando o sistema é entregue.
            </p>
            <a mat-flat-button class="cta" href="#formulario">{{ ctaLabel }}</a>
          </article>
        </div>
      </div>
    </section>

    <!-- 7. FAQ -->
    <section class="section below" aria-labelledby="faq">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Dúvidas</p>
          <h2 id="faq">5 perguntas que todo diretor faz</h2>
        </div>
        <mat-accordion class="faq">
          @for (item of faqs; track item.q) {
            <mat-expansion-panel class="card-surface">
              <mat-expansion-panel-header>
                <mat-panel-title>{{ item.q }}</mat-panel-title>
              </mat-expansion-panel-header>
              <p class="muted">{{ item.a }}</p>
            </mat-expansion-panel>
          }
        </mat-accordion>
      </div>
    </section>

    <!-- 8. Garantia -->
    <section class="section alt below" aria-labelledby="garantia">
      <div class="container">
        <div class="guarantee">
          <p class="seal" aria-hidden="true"><b>R$ 0</b><span>antes da entrega</span></p>
          <h2 id="garantia">Você só paga quando recebe</h2>
          <p class="muted">
            No modelo de pagamento na entrega, o valor acumulado é cobrado apenas quando o sistema
            é entregue. Se eu atrasar, o risco é meu, não da sua empresa.
          </p>
        </div>
      </div>
    </section>

    <!-- 9. Formulário -->
    <section class="section below" id="formulario" aria-labelledby="form-title">
      <div class="container">
        <div class="form-wrap">
          <div class="form-side">
            <p class="eyebrow">Próximo passo</p>
            <h2 id="form-title">Mostre o seu projeto em 2 linhas</h2>
            <p class="muted">
              Conte o que o sistema precisa fazer e onde ele travou. Eu respondo pessoalmente se é
              possível e em quanto tempo.
            </p>
            <p class="muted">
              Prefere e-mail? <a [href]="'mailto:' + email">{{ email }}</a>
            </p>
          </div>

          @if (sent()) {
            <div class="success card-surface">
              <mat-icon>check_circle</mat-icon>
              <p>
                Recebi o seu projeto. Respondo pessoalmente, no e-mail que você informou, se é
                possível e em quanto tempo.
              </p>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="card-surface">
              <mat-form-field appearance="outline">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="nome" autocomplete="name" />
                @if (form.controls.nome.invalid && form.controls.nome.touched) {
                  <mat-error>Informe o seu nome.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cargo</mat-label>
                <input matInput formControlName="cargo" autocomplete="organization-title" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Empresa</mat-label>
                <input matInput formControlName="empresa" autocomplete="organization" />
                @if (form.controls.empresa.invalid && form.controls.empresa.touched) {
                  <mat-error>Informe a empresa.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>E-mail corporativo</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email" />
                @if (form.controls.email.invalid && form.controls.email.touched) {
                  <mat-error>Informe um e-mail válido.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Telefone ou WhatsApp (opcional)</mat-label>
                <input matInput type="tel" formControlName="telefone" autocomplete="tel" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Em 2 linhas: o que o sistema precisa fazer e onde ele travou?</mat-label>
                <textarea matInput rows="4" formControlName="projeto"></textarea>
                @if (form.controls.projeto.invalid && form.controls.projeto.touched) {
                  <mat-error>Descreva o projeto em 2 linhas.</mat-error>
                }
              </mat-form-field>

              <mat-checkbox formControlName="lgpd" class="check">
                Concordo com o uso dos meus dados apenas para receber retorno sobre este contato,
                conforme a LGPD.
              </mat-checkbox>
              @if (form.controls.lgpd.invalid && form.controls.lgpd.touched) {
                <p class="err">É preciso concordar para enviar.</p>
              }

              @if (error()) {
                <p class="err">{{ error() }}</p>
              }

              <button mat-flat-button class="cta" type="submit" [disabled]="submitting()">
                {{ submitting() ? 'Enviando…' : ctaLabel }}
              </button>
            </form>
          }
        </div>
      </div>
    </section>

    <!-- 10. CTA final -->
    <section class="section final below" aria-labelledby="final">
      <div class="container">
        <h2 id="final">É possível. <em>Em semanas, não anos.</em></h2>
        <p>
          1 semana para entender, 2 semanas para você ver funcionando e R$ 0 antes da entrega, se
          preferir.
        </p>
        <a mat-flat-button class="cta" href="#formulario">{{ ctaLabel }}</a>
      </div>
    </section>

    <!-- 11. Nota de LGPD (o rodapé é o global do site) -->
    <section class="container lgpd-note">
      <p class="muted">
        Seus dados são usados apenas para responder ao seu contato, conforme a LGPD (Lei
        13.709/2018).
      </p>
    </section>
  `,
  styles: `
    /* Paleta própria da landing, com escopo no componente: nada vaza para o
       resto do site. O verde claro é o de texto/realce (contraste ≥ 4.5:1 nos
       dois temas); o de preenchimento é fixo, pois já passa sobre branco. */
    :host {
      --cs-navy: #101828;
      --cs-primary: light-dark(#0b7a5e, #2fa583);
      --cs-fill: #0b7a5e;
      --cs-fill-hover: #075e48;
      --cs-highlight: #5fd3ae;
      --cs-on-dark: #ffffff;
      --cs-on-dark-muted: #d0d5dd;

      /* O "primary" do Material passa a ser o verde da landing apenas aqui
         dentro: checkbox, foco dos campos e ripples acompanham a marca. */
      --mat-sys-primary: var(--cs-primary);

      display: block;
    }

    h1, h2, h3 { margin: 0; }
    p { margin: 0; }

    .eyebrow {
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cs-primary);
    }

    .section { padding: 3.75rem 0; }
    .section.alt { background: var(--pw-surface); }
    .below { content-visibility: auto; contain-intrinsic-size: auto 800px; }

    .section-head {
      max-width: 720px;
      margin-bottom: 2.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .section-head h2 { font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 800; }
    .section-head p { font-size: 1.125rem; }

    /* CTA — único rótulo da página */
    /* O verde de preenchimento é fixo nos dois temas: já passa 5.3:1 com
       texto branco, enquanto um verde mais claro reprovaria. */
    .cta.mat-mdc-button-base {
      --mat-button-filled-container-color: var(--cs-fill);
      --mat-button-filled-label-text-color: #fff;
      --mat-button-filled-container-shape: 30px;
      --mat-button-filled-container-height: 52px;
      --mat-button-filled-horizontal-padding: 1.75rem;
      --mat-button-filled-label-text-weight: 700;
      --mat-button-filled-label-text-size: 1rem;
    }
    .cta.mat-mdc-button-base:hover:not(:disabled) {
      --mat-button-filled-container-color: var(--cs-fill-hover);
    }

    /* 1. Hero */
    .hero { padding-top: 2.5rem; padding-bottom: 3.5rem; }
    .hero-grid { display: flex; flex-direction: column; gap: 2.25rem; }
    .hero-copy { display: flex; flex-direction: column; gap: 1.25rem; }
    .hero h1 { font-size: clamp(2.25rem, 9vw, 3.75rem); font-weight: 800; }
    .hero h1 em { font-style: normal; color: var(--cs-primary); }
    .hero-sub { font-size: 1.25rem; max-width: 560px; }
    .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
    .hero-note { font-size: 0.875rem; }

    .hero-media { position: relative; width: 100%; max-width: 420px; align-self: center; }
    .hero-media img {
      width: 100%;
      height: auto;
      aspect-ratio: 768 / 1376;
      object-fit: cover;
      border-radius: var(--pw-radius);
      display: block;
    }
    .badge {
      position: absolute;
      left: 0.75rem;
      bottom: 1.75rem;
      max-width: 260px;
      padding: 0.875rem 1.125rem;
      background: var(--cs-navy);
      color: var(--cs-on-dark);
      border: 2px solid var(--cs-highlight);
      border-radius: var(--pw-radius);
    }
    .badge small {
      display: block;
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--cs-highlight);
    }
    .badge strong { font-size: 1.25rem; line-height: 1.25; }

    .stats { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2.5rem; }
    .stat { padding: 1.125rem 1.25rem; display: flex; gap: 1rem; align-items: baseline; }
    .stat b { font-size: 1.875rem; font-weight: 800; color: var(--cs-primary); white-space: nowrap; }

    /* Cards */
    .cards { display: flex; flex-direction: column; gap: 1rem; }
    .card { padding: 1.625rem; display: flex; flex-direction: column; gap: 0.625rem; }
    .card .num { font-size: 2.25rem; font-weight: 800; line-height: 1.05; color: var(--cs-primary); }
    .card h3 { font-size: 1.25rem; }

    /* 3. Prova — blocos escuros nos dois temas */
    .case { background: var(--cs-navy); border-color: var(--cs-navy); color: var(--cs-on-dark); }
    .case .num { color: var(--cs-highlight); }
    .case p { color: var(--cs-on-dark-muted); }
    .case .tag {
      align-self: flex-start;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--cs-navy);
      background: var(--cs-highlight);
      padding: 0.25rem 0.625rem;
      border-radius: 30px;
    }
    .case-quote {
      border-top: 1px solid rgba(255, 255, 255, 0.18);
      padding-top: 0.75rem;
      font-size: 0.875rem;
    }

    /* 4. Como funciona */
    .steps { display: flex; flex-direction: column; gap: 1rem; }
    .step { display: flex; gap: 1.125rem; padding: 1.5rem; }
    .step-n {
      flex: none;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--cs-navy);
      color: var(--cs-highlight);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
    }
    .step h3 { font-size: 1.25rem; margin-bottom: 0.375rem; }
    .step .when {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--cs-primary);
    }

    /* 5. Oferta */
    .offer { display: flex; flex-direction: column; gap: 1.25rem; }
    .checklist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .checklist li {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: var(--pw-bg);
      border: 1px solid var(--pw-border);
      border-radius: 10px;
      padding: 0.875rem 1rem;
    }
    .checklist mat-icon { flex: none; color: var(--cs-primary); }
    .not-box {
      align-self: flex-start;
      border: 2px dashed var(--pw-border);
      border-radius: var(--pw-radius);
      padding: 1.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .not-box h3 { font-size: 1.125rem; }

    /* 6. Planos */
    .plans { display: flex; flex-direction: column; gap: 1rem; }
    .plan {
      position: relative;
      padding: 1.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      align-items: flex-start;
    }
    .plan.featured { border: 2px solid var(--cs-fill); }
    .plan .ribbon {
      position: absolute;
      top: -0.875rem;
      left: 1.5rem;
      background: var(--cs-fill);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 30px;
    }
    .plan h3 { font-size: 1.25rem; }
    .price { font-size: 2.25rem; font-weight: 800; line-height: 1.1; }
    .price small { font-size: 1rem; font-weight: 600; color: var(--pw-muted); }

    /* 7. FAQ */
    .faq { display: flex; flex-direction: column; gap: 0.75rem; max-width: 860px; }
    .faq mat-expansion-panel {
      --mat-expansion-container-background-color: var(--pw-surface);
      --mat-expansion-container-shape: var(--pw-radius);
      border: 1px solid var(--pw-border);
    }
    .section.alt .faq mat-expansion-panel {
      --mat-expansion-container-background-color: var(--pw-bg);
    }
    .faq mat-panel-title { font-weight: 700; font-size: 1.0625rem; }

    /* 8. Garantia */
    .guarantee {
      max-width: 760px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .seal {
      width: 132px;
      height: 132px;
      border-radius: 50%;
      background: var(--cs-navy);
      border: 4px solid var(--cs-highlight);
      color: var(--cs-on-dark);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.1;
    }
    .seal b { font-size: 2rem; color: var(--cs-highlight); }
    .seal span { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    .guarantee h2 { font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 800; }
    .guarantee p { font-size: 1.125rem; }

    /* 9. Formulário */
    #formulario { scroll-margin-top: 80px; }
    .form-wrap { display: flex; flex-direction: column; gap: 1.75rem; }
    .form-side { display: flex; flex-direction: column; gap: 0.875rem; }
    .form-side h2 { font-size: clamp(1.75rem, 5vw, 1.875rem); font-weight: 800; }
    .form-side a { text-decoration: underline; }
    form {
      padding: 1.625rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    form .check { margin: 0.25rem 0 0.75rem; }
    form .cta { width: 100%; }
    .success { display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem; }
    .success mat-icon { color: #16a34a; }
    .err { color: light-dark(#b91c1c, #f87171); font-size: 0.875rem; }

    /* 10. CTA final */
    .final { background: var(--cs-navy); color: var(--cs-on-dark); }
    .final .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.125rem;
    }
    .final h2 { font-size: clamp(2rem, 7vw, 3.5rem); font-weight: 800; }
    .final h2 em { font-style: normal; color: var(--cs-highlight); }
    .final p { color: var(--cs-on-dark-muted); font-size: 1.125rem; max-width: 640px; }

    .lgpd-note { padding-top: 2rem; padding-bottom: 2rem; }
    .lgpd-note p { font-size: 0.8125rem; }

    @media (min-width: 768px) {
      .section { padding: 6rem 0; }
      .hero { padding-top: 4.5rem; padding-bottom: 6rem; }
      .hero-grid { flex-direction: row; align-items: center; gap: 4rem; }
      .hero-copy { flex: 1 1 0; }
      .hero-media { flex: 0 0 380px; }
      .stats { flex-direction: row; }
      .stat { flex: 1; flex-direction: column; gap: 0.25rem; }
      .cards, .steps, .plans { flex-direction: row; }
      .cards > *, .steps > *, .plans > * { flex: 1; }
      .step { flex-direction: column; }
      .offer { flex-direction: row; gap: 2.5rem; }
      .checklist { flex: 1.4; }
      .not-box { flex: 1; }
      .form-wrap { flex-direction: row; align-items: flex-start; gap: 3.5rem; }
      .form-side { flex: 1; }
      form, .success { flex: 1.2; }
      form { padding: 2.25rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      .cta.mat-mdc-button-base { transition: none; }
    }
  `,
})
export default class Consultoria {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  /** Rótulo único de CTA na página inteira. */
  readonly ctaLabel = 'Mostrar meu projeto';
  readonly email = 'danilo@neumannmarques.com';

  readonly included = [
    {
      title: 'Desenvolvimento de ponta a ponta:',
      text: 'a aplicação e o deploy em nuvem.',
    },
    {
      title: '1 semana de levantamento',
      text: 'com a diretoria para definir o que o sistema precisa fazer.',
    },
    {
      title: '1ª versão em até 2 semanas,',
      text: 'rodando no seu ambiente real.',
    },
    {
      title: 'Integrações e automações',
      text: 'entre os sistemas que a empresa já usa.',
    },
    {
      title: '1 responsável do início ao fim:',
      text: 'quem levanta os requisitos é quem desenvolve e entrega.',
    },
  ];

  readonly faqs: Faq[] = [
    {
      q: 'Meu projeto está com outra consultoria. Dá para assumir no meio?',
      a: 'Dá. Foi exatamente o caso do projeto parado havia 2 anos. Na 1ª semana eu avalio o que já existe e o que vale aproveitar.',
    },
    {
      q: 'Não sei descrever direito o sistema que quero. Isso é um problema?',
      a: 'Não. É para isso que serve a 1ª semana: transformar a ideia da diretoria em requisitos e numa proposta.',
    },
    {
      q: 'Rápido assim, a qualidade não sofre?',
      a: 'Por isso a 1ª versão roda no seu ambiente em até 2 semanas: você e o seu TI avaliam o sistema funcionando, não uma promessa. E no pagamento na entrega, você só paga quando recebe.',
    },
    {
      q: 'Meu gestor de TI precisa participar?',
      a: 'Precisa, e é bom que participe desde a 1ª semana. No caso real, o TI começou cético e passou a apoiar quando viu as entregas.',
    },
    {
      q: 'E os dados do sistema antigo?',
      a: 'A migração dos dados entra no levantamento da 1ª semana. Você sai dela sabendo o que dá para migrar e como.',
    },
  ];

  readonly submitting = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  // Os limites espelham o CreateContactRequest da API (nome 120, e-mail 200,
  // assunto 200, mensagem 5000): barrar aqui evita um 400 sem explicação.
  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    cargo: ['', Validators.maxLength(120)],
    empresa: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    telefone: ['', Validators.maxLength(40)],
    projeto: ['', [Validators.required, Validators.maxLength(4000)]],
    lgpd: [false, Validators.requiredTrue],
  });

  constructor() {
    inject(Title).setTitle('É possível: seu sistema no ar em semanas | neumannmarques');
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Projeto de software travado, caro ou demorado? Consultoria que tira do papel em semanas: 1ª versão no seu ambiente em até 2 semanas e pagamento na entrega.',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    // Reaproveita a API de contato sem mudanças: cargo, empresa e telefone vão
    // no corpo da mensagem, e a empresa também no assunto, para o admin.
    const message = [
      `Cargo: ${v.cargo.trim() || '—'}`,
      `Empresa: ${v.empresa.trim()}`,
      `Telefone/WhatsApp: ${v.telefone.trim() || '—'}`,
      '',
      'O que o sistema precisa fazer e onde travou:',
      v.projeto.trim(),
      '',
      'LGPD: consentimento dado no formulário de /consultoria.',
    ].join('\n');

    this.api
      .submitContact({
        name: v.nome.trim(),
        email: v.email.trim(),
        subject: `[Consultoria] ${v.empresa.trim()}`,
        message,
      })
      .subscribe({
        next: () => {
          this.sent.set(true);
        },
        error: () => {
          this.error.set(
            'Algo deu errado no envio. Tente de novo ou me escreva direto em ' + this.email + '.',
          );
          this.submitting.set(false);
        },
      });
  }
}
