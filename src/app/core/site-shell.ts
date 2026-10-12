import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Public marketing layout: sticky header + footer around projected page content. */
@Component({
  selector: 'app-site-shell',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top">
      <div class="wrap bar">
        <a routerLink="/" class="brand"><span class="logo">F</span>Fin</a>
        <nav class="links" [class.open]="open()" aria-label="Main">
          <a routerLink="/" fragment="top" (click)="open.set(false)">Home</a>
          <a routerLink="/" fragment="features" (click)="open.set(false)">Features</a>
          <a routerLink="/" fragment="pricing" (click)="open.set(false)">Pricing</a>
          <a routerLink="/" fragment="faq" (click)="open.set(false)">FAQ</a>
          <a routerLink="/contact" routerLinkActive="active" (click)="open.set(false)">Contact us</a>
        </nav>
        <div class="actions">
          <button class="icon" (click)="toggleTheme()" [attr.aria-label]="dark() ? 'Switch to light theme' : 'Switch to dark theme'">{{ dark() ? '☀' : '☾' }}</button>
          <a routerLink="/login" class="btn ghost hide-sm">Sign in</a>
          <a routerLink="/signup" class="btn primary">Get started</a>
          <button class="icon burger" (click)="open.set(!open())" aria-label="Toggle menu" [attr.aria-expanded]="open()">☰</button>
        </div>
      </div>
    </header>

    <main id="top"><ng-content /></main>

    <footer class="foot">
      <div class="wrap cols">
        <div class="about">
          <a routerLink="/" class="brand"><span class="logo">F</span>Fin</a>
          <p class="muted">Clear, simple finance tools for growing teams.</p>
        </div>
        <div><h4>Product</h4><a routerLink="/" fragment="features">Features</a><a routerLink="/" fragment="pricing">Pricing</a><a routerLink="/overview">Live demo</a></div>
        <div><h4>Company</h4><a routerLink="/contact">Contact us</a><a routerLink="/" fragment="faq">FAQ</a></div>
        <div><h4>Account</h4><a routerLink="/login">Sign in</a><a routerLink="/signup">Create account</a><a routerLink="/forgot-password">Reset password</a></div>
      </div>
      <div class="wrap legal muted">© 2026 Fin Ltd. All rights reserved. Sample content for demonstration.</div>
    </footer>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: var(--bg); color: var(--text); }
    .wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
    .top { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    .bar { display: flex; align-items: center; gap: 24px; height: 64px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--text); text-decoration: none; }
    .logo { width: 30px; height: 30px; border-radius: 8px; background: var(--primary); color: #fff; display: grid; place-items: center; }
    .links { display: flex; gap: 6px; margin: 0 auto; }
    .links a { padding: 8px 14px; border-radius: 8px; color: var(--muted); text-decoration: none; font-weight: 500; } .links a:hover, .links a.active { color: var(--text); background: var(--surface-2); }
    .actions { display: flex; align-items: center; gap: 10px; }
    .icon { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); } .burger { display: none; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); text-decoration: none; font-weight: 500; color: var(--text); background: var(--surface); }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.ghost { background: none; border-color: transparent; }
    .foot { border-top: 1px solid var(--border); padding: 48px 0 24px; background: var(--surface); }
    .cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 32px; } .cols div { display: grid; gap: 10px; align-content: start; }
    .cols h4 { margin: 0 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); } .cols a:not(.brand) { color: var(--text); text-decoration: none; } .cols a:not(.brand):hover { color: var(--primary); }
    .legal { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 13px; }
    @media (max-width: 860px) {
      .burger { display: grid; place-items: center; } .hide-sm { display: none; }
      .links { display: none; position: absolute; left: 0; right: 0; top: 64px; flex-direction: column; background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 24px; margin: 0; }
      .links.open { display: flex; } .cols { grid-template-columns: 1fr 1fr; }
    }
  `,
})
export class SiteShell {
  protected readonly dark = signal(document.documentElement.dataset['theme'] === 'dark');
  protected readonly open = signal(false);
  protected toggleTheme() {
    const next = !this.dark(); this.dark.set(next);
    document.documentElement.dataset['theme'] = next ? 'dark' : 'light';
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  }
}
