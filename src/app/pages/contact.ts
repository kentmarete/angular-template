import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../core/site-shell';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, RouterLink, SiteShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-site-shell>
      <section class="head">
        <div class="wrap"><p class="eyebrow">Contact us</p><h1>We'd love to hear from you</h1>
          <p class="lead">Questions, feedback or a custom plan in mind? Send us a message and we'll reply within one business day.</p></div>
      </section>

      <section class="wrap grid">
        <aside class="info">
          @for (c of channels; track c.title) {
            <div class="card ch"><span class="ci"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="c.icon"/></svg></span>
              <div><strong>{{ c.title }}</strong><p class="muted">{{ c.line1 }}<br>{{ c.line2 }}</p></div></div>
          }
          <p class="muted small">Looking for quick answers? Check the <a routerLink="/" fragment="faq">FAQ</a>.</p>
        </aside>

        <div class="card formcard">
          @if (sent()) {
            <div class="done" role="status"><span class="ok">✓</span><h2>Message sent</h2>
              <p class="muted">Thanks, {{ form.controls.name.value }}. We'll get back to you at {{ form.controls.email.value }} soon.</p>
              <button class="btn" (click)="again()">Send another message</button></div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <h2>Send a message</h2>
              <div class="row2">
                <label>Full name<input formControlName="name" autocomplete="name" [class.invalid]="bad('name')" />@if (bad('name')) { <small class="err">Please enter your name.</small> }</label>
                <label>Email<input type="email" formControlName="email" autocomplete="email" [class.invalid]="bad('email')" />@if (bad('email')) { <small class="err">Enter a valid email address.</small> }</label>
              </div>
              <label>Topic
                <select formControlName="topic">@for (t of topics; track t) { <option [value]="t">{{ t }}</option> }</select></label>
              <label>Message
                <textarea rows="6" formControlName="message" maxlength="1000" [class.invalid]="bad('message')" placeholder="How can we help?"></textarea>
                @if (bad('message')) { <small class="err">Please write at least 10 characters.</small> }
                <small class="muted r">{{ form.controls.message.value.length }}/1000</small></label>
              <label class="inline"><input type="checkbox" formControlName="consent" /> I agree to be contacted about my enquiry.</label>
              @if (bad('consent')) { <small class="err">Please tick the box to continue.</small> }
              <button class="btn primary" type="submit" [disabled]="busy()">{{ busy() ? 'Sending…' : 'Send message' }}</button>
            </form>
          }
        </div>
      </section>
    </app-site-shell>
  `,
  styles: `
    .wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; } .small { font-size: 13px; }
    .head { text-align: center; padding: 64px 0 40px; background: radial-gradient(700px 300px at 50% -20%, color-mix(in srgb, var(--primary) 20%, transparent), transparent); }
    .eyebrow { color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; margin: 0 0 10px; }
    h1 { font-size: clamp(30px, 5vw, 46px); letter-spacing: -.03em; margin: 0 0 12px; } .lead { color: var(--muted); max-width: 560px; margin: 0 auto; font-size: 17px; }
    .grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 28px; padding-bottom: 88px; align-items: start; }
    .info { display: grid; gap: 14px; } .ch { display: flex; gap: 14px; padding: 18px; align-items: flex-start; } .ch p { margin: 2px 0 0; font-size: 14px; }
    .ci { width: 42px; height: 42px; border-radius: 12px; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; flex: none; }
    a { color: var(--primary); text-decoration: none; } a:hover { text-decoration: underline; }
    .formcard { padding: 28px; } form { display: grid; gap: 16px; } h2 { font-size: 20px; margin: 0; } .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; }
    input:not([type=checkbox]), select, textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 11px 14px; font: inherit; font-weight: 400; outline: none; }
    input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); } .invalid { border-color: var(--red) !important; } textarea { resize: vertical; }
    .err { color: var(--red); font-weight: 400; } .r { text-align: right; } .inline { display: flex; align-items: center; gap: 10px; font-weight: 400; } input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; margin: 0; }
    .btn { padding: 12px 22px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); font-weight: 600; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn:disabled { opacity: .65; cursor: progress; }
    .done { display: grid; justify-items: center; gap: 10px; text-align: center; padding: 40px 0; } .done p { margin: 0; max-width: 360px; }
    .ok { width: 56px; height: 56px; border-radius: 50%; background: var(--green-soft); color: var(--green); display: grid; place-items: center; font-size: 26px; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } .row2 { grid-template-columns: 1fr; } }
  `,
})
export class Contact {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly topics = ['General question', 'Sales & pricing', 'Technical support', 'Partnership', 'Feedback'];
  protected readonly channels = [
    { title: 'Email', line1: 'hello@fin.example.com', line2: 'support@fin.example.com', icon: 'M3 6h18v12H3zM3 7l9 7 9-7' },
    { title: 'Phone', line1: '+254 700 000 000', line2: 'Mon–Fri, 9am–5pm EAT', icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z' },
    { title: 'Office', line1: '12 Riverside Drive', line2: 'Nairobi, Kenya', icon: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
  ];
  protected readonly form = this.fb.group({
    name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], topic: this.topics[0],
    message: ['', [Validators.required, Validators.minLength(10)]], consent: [false, Validators.requiredTrue],
  });

  protected bad(k: 'name' | 'email' | 'message' | 'consent') { const c = this.form.controls[k]; return c.invalid && (c.touched || c.dirty); }
  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    // Demo only: no backend yet. Replace with a real submission (API, email service, etc.).
    setTimeout(() => { this.busy.set(false); this.sent.set(true); }, 700);
  }
  protected again() { this.form.reset({ topic: this.topics[0] }); this.sent.set(false); }
}
