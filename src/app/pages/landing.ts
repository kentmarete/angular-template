import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../core/site-shell';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, SiteShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-site-shell>
      <!-- Hero -->
      <section class="hero">
        <div class="wrap">
          <a class="pill" routerLink="/overview">✨ New: invoices &amp; team permissions <span>→</span></a>
          <h1>Manage your finances with <em>clarity</em></h1>
          <p class="lead">Track spending, send invoices and manage your team in one clean dashboard — built for teams that want answers, not spreadsheets.</p>
          <div class="cta">
            <a class="btn primary lg" routerLink="/signup">Get started free</a>
            <a class="btn lg" routerLink="/overview">View live demo</a>
          </div>
          <p class="muted small">No credit card required · Free plan forever</p>

          <div class="mock card" aria-hidden="true">
            <div class="mk-side"><i class="a"></i><i></i><i></i><i></i><i></i></div>
            <div class="mk-main">
              <div class="mk-kpis"><div><small>Net balance</small><b>$28,620</b></div><div><small>Income</small><b>$6,040</b></div><div><small>Expenses</small><b>$2,000</b></div></div>
              <div class="mk-chart">
                @for (h of bars; track $index) { <span><i [style.height.%]="h[0]"></i><i class="o" [style.height.%]="h[1]"></i></span> }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="sec">
        <div class="wrap">
          <p class="eyebrow">Features</p><h2>Everything you need to stay in control</h2>
          <p class="sub muted">Powerful tools wrapped in an interface your whole team will actually enjoy using.</p>
          <div class="feats">
            @for (f of features; track f.title) {
              <article class="card feat">
                <span class="fi"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="f.icon"/></svg></span>
                <h3>{{ f.title }}</h3><p class="muted">{{ f.text }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- Steps -->
      <section class="sec alt">
        <div class="wrap">
          <p class="eyebrow">How it works</p><h2>Up and running in three steps</h2>
          <ol class="steps">
            @for (s of steps; track s.title; let i = $index) {
              <li><span class="n">{{ i + 1 }}</span><h3>{{ s.title }}</h3><p class="muted">{{ s.text }}</p></li>
            }
          </ol>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="sec">
        <div class="wrap">
          <p class="eyebrow">Pricing</p><h2>Simple, transparent pricing</h2>
          <div class="toggle" role="group" aria-label="Billing period">
            <button [class.on]="!yearly()" (click)="yearly.set(false)">Monthly</button>
            <button [class.on]="yearly()" (click)="yearly.set(true)">Yearly <small>−20%</small></button>
          </div>
          <div class="plans">
            @for (p of plans; track p.name) {
              <article class="card plan" [class.hot]="p.hot">
                @if (p.hot) { <span class="tag">Most popular</span> }
                <h3>{{ p.name }}</h3><p class="muted">{{ p.blurb }}</p>
                <div class="price">@if (p.price === null) { <b>Custom</b> } @else { <b>\${{ yearly() ? round(p.price * 0.8) : p.price }}</b><span class="muted">/month</span> }</div>
                <ul>@for (x of p.items; track x) { <li><span class="tick">✓</span>{{ x }}</li> }</ul>
                <a class="btn lg" [class.primary]="p.hot" [routerLink]="p.price === null ? '/contact' : '/signup'">{{ p.price === null ? 'Contact sales' : 'Choose ' + p.name }}</a>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="sec alt">
        <div class="wrap narrow">
          <p class="eyebrow">FAQ</p><h2>Questions? We have answers</h2>
          <div class="faq">
            @for (q of faqs; track q.q) { <details class="card"><summary>{{ q.q }}</summary><p class="muted">{{ q.a }}</p></details> }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="sec">
        <div class="wrap">
          <div class="banner">
            <h2>Ready to take control of your finances?</h2>
            <p>Join in minutes. Upgrade whenever your team grows.</p>
            <div class="cta"><a class="btn white lg" routerLink="/signup">Create free account</a><a class="btn outline lg" routerLink="/contact">Talk to us</a></div>
          </div>
        </div>
      </section>
    </app-site-shell>
  `,
  styles: `
    :host { display: block; }
    .wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; } .narrow { max-width: 760px; } .small { font-size: 13px; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); color: var(--text); text-decoration: none; font-weight: 600; text-align: center; }
    .btn.lg { padding: 13px 26px; font-size: 15px; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .btn.white { background: #fff; color: #0f3d91; border-color: #fff; } .btn.outline { background: transparent; color: #fff; border-color: rgb(255 255 255 / .5); }
    .hero { text-align: center; padding: 72px 0 40px; background: radial-gradient(900px 400px at 50% -10%, color-mix(in srgb, var(--primary) 22%, transparent), transparent); }
    .pill { display: inline-flex; gap: 8px; padding: 6px 14px; border-radius: 99px; background: var(--primary-soft); color: var(--primary); text-decoration: none; font-size: 13px; font-weight: 500; margin-bottom: 22px; }
    h1 { font-size: clamp(34px, 6vw, 62px); line-height: 1.08; letter-spacing: -.03em; max-width: 860px; margin: 0 auto 18px; } h1 em { font-style: normal; background: linear-gradient(90deg, var(--primary), var(--violet)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .lead { font-size: 18px; color: var(--muted); max-width: 640px; margin: 0 auto 28px; }
    .cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
    .mock { display: grid; grid-template-columns: 70px 1fr; max-width: 900px; margin: 48px auto 0; text-align: left; overflow: hidden; box-shadow: 0 30px 80px rgb(0 0 0 / .35); }
    .mk-side { background: var(--surface); border-right: 1px solid var(--border); padding: 16px 14px; display: grid; gap: 12px; align-content: start; } .mk-side i { height: 12px; border-radius: 4px; background: var(--surface-2); } .mk-side i.a { background: var(--primary-soft); border: 1px solid var(--primary); }
    .mk-main { padding: 20px; display: grid; gap: 20px; background: var(--bg); } .mk-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .mk-kpis div { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: grid; } .mk-kpis small { color: var(--muted); font-size: 11px; } .mk-kpis b { font-size: 20px; }
    .mk-chart { display: flex; align-items: flex-end; justify-content: space-around; height: 150px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px 0; }
    .mk-chart span { display: flex; gap: 4px; align-items: flex-end; height: 100%; } .mk-chart i { width: 16px; background: var(--primary); border-radius: 4px 4px 0 0; } .mk-chart i.o { background: var(--amber); }
    .sec { padding: 88px 0; } .sec.alt { background: var(--surface); border-block: 1px solid var(--border); }
    .eyebrow { text-align: center; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; margin: 0 0 10px; }
    h2 { text-align: center; font-size: clamp(26px, 4vw, 38px); letter-spacing: -.02em; margin: 0 0 12px; } .sub { text-align: center; max-width: 560px; margin: 0 auto 44px; }
    .feats { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 44px; }
    .feat { padding: 24px; display: grid; gap: 8px; } .feat h3 { margin: 6px 0 0; font-size: 17px; } .feat p { margin: 0; }
    .fi { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; }
    .steps { list-style: none; margin: 44px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px; text-align: center; }
    .n { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: #fff; display: inline-grid; place-items: center; font-weight: 700; font-size: 18px; } .steps h3 { margin: 14px 0 6px; } .steps p { margin: 0; }
    .toggle { display: flex; width: max-content; margin: 18px auto 40px; padding: 4px; border-radius: 10px; background: var(--surface-2); } .toggle button { border: 0; background: none; padding: 7px 18px; border-radius: 7px; color: var(--muted); font-weight: 500; } .toggle button.on { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgb(0 0 0 / .25); } .toggle small { color: var(--green); margin-left: 4px; }
    .plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px; align-items: stretch; }
    .plan { padding: 28px; display: grid; gap: 14px; align-content: start; position: relative; } .plan.hot { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 20px 50px color-mix(in srgb, var(--primary) 18%, transparent); }
    .tag { position: absolute; top: -12px; left: 50%; translate: -50% 0; background: var(--primary); color: #fff; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 99px; }
    .plan h3 { margin: 0; font-size: 18px; } .plan p { margin: 0; } .price b { font-size: 40px; letter-spacing: -.03em; } .price span { margin-left: 4px; }
    .plan ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; } .tick { color: var(--green); margin-right: 10px; font-weight: 700; }
    .faq { display: grid; gap: 12px; margin-top: 36px; } details { padding: 4px 20px; } summary { cursor: pointer; padding: 14px 0; font-weight: 600; list-style: none; display: flex; justify-content: space-between; } summary::after { content: '＋'; color: var(--muted); } details[open] summary::after { content: '−'; } details p { margin: 0 0 16px; }
    .banner { border-radius: 20px; padding: 56px 32px; text-align: center; color: #fff; background: linear-gradient(135deg, #0f3d91, #4b3fd6 55%, #7c5cfc); } .banner h2 { color: #fff; } .banner p { opacity: .85; margin: 0 0 24px; }
    @media (max-width: 640px) { .hero { padding-top: 48px; } .sec { padding: 60px 0; } .mock { grid-template-columns: 1fr; } .mk-side { display: none; } .mk-kpis { grid-template-columns: repeat(2, 1fr); } .mk-kpis div:nth-child(3) { display: none; } .mk-main { padding: 14px; } .mk-chart { padding: 12px 8px 0; } .mk-chart i { width: 10px; } }
  `,
})
export class Landing {
  protected readonly yearly = signal(false);
  protected readonly bars = [[40, 28], [55, 35], [70, 30], [50, 42], [62, 33], [85, 45], [58, 30]];
  protected round(n: number) { return Math.round(n); }
  protected readonly features = [
    { title: 'Smart dashboard', text: 'See balances, income and spending at a glance with charts that update as you work.', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
    { title: 'Invoicing', text: 'Create, preview and send professional invoices, then track what is paid, pending or overdue.', icon: 'M6 3h9l4 4v14H6zM9 13h7M9 17h7' },
    { title: 'Team permissions', text: 'Invite teammates and give each person exactly the access they need with custom roles.', icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z' },
    { title: 'Product catalogue', text: 'Keep products, stock levels and pricing organised in one searchable list.', icon: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8' },
    { title: 'Built-in chat', text: 'Talk to your team without leaving the app and keep conversations next to the work.', icon: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z' },
    { title: 'Light & dark themes', text: 'A clean interface that looks great in any lighting and respects your system settings.', icon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z' },
  ];
  protected readonly steps = [
    { title: 'Create your account', text: 'Sign up in under a minute. No credit card needed.' },
    { title: 'Invite your team', text: 'Add teammates and choose what each role can see and do.' },
    { title: 'Start tracking', text: 'Add invoices and products, and watch your dashboard come to life.' },
  ];
  protected readonly plans = [
    { name: 'Free', price: 0, blurb: 'For individuals getting started.', hot: false, items: ['1 user', '5 invoices / month', 'Basic dashboard', 'Community support'] },
    { name: 'Pro', price: 29, blurb: 'For growing teams that need more.', hot: true, items: ['Up to 10 users', 'Unlimited invoices', 'Roles & permissions', 'Priority email support'] },
    { name: 'Enterprise', price: null, blurb: 'For organisations with advanced needs.', hot: false, items: ['Unlimited users', 'Custom roles & SSO', 'Dedicated manager', 'Custom contracts'] },
  ];
  protected readonly faqs = [
    { q: 'Is there a free plan?', a: 'Yes. The Free plan is free forever for individuals. You can upgrade to Pro at any time when your needs grow.' },
    { q: 'Can I change or cancel my plan?', a: 'Absolutely. You can upgrade, downgrade or cancel from your account settings whenever you like.' },
    { q: 'How do roles and permissions work?', a: 'Choose a built-in role or create your own, then fine-tune individual permissions for each person on your team.' },
    { q: 'Do you offer discounts for yearly billing?', a: 'Yes — paying yearly saves 20% compared with monthly billing.' },
    { q: 'How can I reach your team?', a: 'Use the Contact us page and we will get back to you within one business day.' },
  ];
}
