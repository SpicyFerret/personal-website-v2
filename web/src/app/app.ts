import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { HeaderComponent } from './shared/header.component';
import { FooterComponent } from './shared/footer.component';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="app-main">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .app-main {
      flex: 1 1 auto;
    }
  `,
})
export class App {
  constructor() {
    // mat-icon defaults to the legacy "material-icons" font class; we load
    // Material Symbols Outlined (index.html), so point the registry at it —
    // otherwise every icon renders as its ligature text.
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    inject(ThemeService); // instantiate so the persisted theme is applied
  }
}
