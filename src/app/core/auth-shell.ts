import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Full-screen split layout for auth pages: artwork on the left, projected form centred on the right. */
@Component({
  selector: 'app-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <section class="hero" aria-hidden="true">
        <svg class="art" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f3d91"/><stop offset=".55" stop-color="#4b3fd6"/><stop offset="1" stop-color="#7c5cfc"/></linearGradient>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
          </defs>
          <rect width="600" height="800" fill="url(#bg)"/>
          <circle cx="520" cy="110" r="190" fill="#fff" opacity=".07"/><circle cx="60" cy="700" r="230" fill="#fff" opacity=".06"/>
          <g fill="#fff" opacity=".12"><rect x="70" y="470" width="42" height="170" rx="8"/><rect x="140" y="410" width="42" height="230" rx="8"/><rect x="210" y="350" width="42" height="290" rx="8"/><rect x="280" y="300" width="42" height="340" rx="8"/><rect x="350" y="360" width="42" height="280" rx="8"/><rect x="420" y="250" width="42" height="390" rx="8"/></g>
          <path d="M60 560 C130 520 170 470 230 430 S330 380 380 340 450 250 540 190 L540 640 L60 640Z" fill="url(#area)"/>
          <path d="M60 560 C130 520 170 470 230 430 S330 380 380 340 450 250 540 190" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
          <circle cx="540" cy="190" r="9" fill="#fff"/>
        </svg>
        <div class="copy">
          <span class="logo">F</span>
          <h2>Know where every dollar goes.</h2>
          <p>Track spending, manage teams and keep your finances in one clean dashboard.</p>
        </div>
      </section>
      <main class="panel"><ng-content /></main>
    </div>
  `,
  styles: `
    .page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; background: var(--bg); }
    .hero { position: relative; overflow: hidden; color: #fff; display: flex; align-items: flex-end; }
    .art { position: absolute; inset: 0; width: 100%; height: 100%; }
    .copy { position: relative; padding: 56px; max-width: 520px; display: grid; gap: 14px; }
    .logo { width: 40px; height: 40px; border-radius: 10px; background: rgb(255 255 255 / .2); display: grid; place-items: center; font-weight: 700; font-size: 20px; backdrop-filter: blur(6px); }
    .copy h2 { font-size: 34px; line-height: 1.15; letter-spacing: -.02em; }
    .copy p { opacity: .85; font-size: 16px; }
    .panel { display: grid; place-items: center; padding: 32px 24px; }
    @media (max-width: 860px) { .page { grid-template-columns: 1fr; } .hero { display: none; } }
  `,
})
export class AuthShell {}
