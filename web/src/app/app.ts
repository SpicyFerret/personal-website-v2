import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { FooterComponent } from './shared/footer.component';

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
export class App {}
