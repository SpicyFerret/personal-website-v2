import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, requestContextInterceptor]),
    ),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
  ],
};
