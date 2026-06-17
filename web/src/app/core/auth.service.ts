import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './config';
import { LoginResponse } from './models';

const TOKEN_KEY = 'pw_token';
const NAME_KEY = 'pw_name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _token = signal<string | null>(this.read(TOKEN_KEY));
  readonly displayName = signal<string | null>(this.read(NAME_KEY));

  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this._token.set(res.token);
          this.displayName.set(res.displayName);
          this.write(TOKEN_KEY, res.token);
          this.write(NAME_KEY, res.displayName);
        }),
      );
  }

  logout(): void {
    this._token.set(null);
    this.displayName.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(NAME_KEY);
    }
  }

  private read(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private write(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }
}
