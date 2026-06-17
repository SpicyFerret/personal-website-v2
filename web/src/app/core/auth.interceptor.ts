import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_BASE_URL } from './config';

/** Attaches the JWT bearer token to API requests. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Attach the JWT only to API calls — relative (/api/...) or an explicit cross-origin base.
  const isApiCall =
    req.url.startsWith('/api') || (!!API_BASE_URL && req.url.startsWith(API_BASE_URL));

  if (token && isApiCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
