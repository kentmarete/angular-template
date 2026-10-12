import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-forms',
  imports: [ReactiveFormsModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="layout" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="col">
        <section class="card pad">
          <h2>Text inputs</h2>
          <div class="row2">
            <label>Full name<input type="text" formControlName="name" placeholder="Jane Doe" /></label>
            <label>Email
              <input type="email" formControlName="email" placeholder="jane&#64;company.com" [class.invalid]="bad('email')" />
              @if (bad('email')) { <small class="err">Enter a valid email address.</small> }
            </label>
            <label>Password<input type="password" formControlName="password" placeholder="••••••••" /></label>
            <label>Phone<input type="tel" formControlName="phone" placeholder="+254 700 000 000" /></label>
            <label>Website<input type="url" formControlName="website" placeholder="https://" /></label>
            <label>Search<input type="search" formControlName="search" placeholder="Search…" /></label>
            <label>Number<input type="number" formControlName="amount" min="0" step="0.01" /></label>
            <label>Disabled<input type="text" value="Can't edit this" disabled /></label>
            <label>Read-only<input type="text" value="Read-only value" readonly /></label>
          </div>
        </section>

        <section class="card pad">
          <h2>Textarea</h2>
          <label>Message
            <textarea rows="4" formControlName="message" maxlength="200" placeholder="Write something…"></textarea>
            <small class="muted">{{ form.controls.message.value.length }}/200</small>
          </label>
        </section>

        <section class="card pad">
          <h2>Date, time, colour &amp; file</h2>
          <div class="row2">
            <label>Date<input type="date" formControlName="date" /></label>
            <label>Time<input type="time" formControlName="time" /></label>
            <label>Colour<input type="color" formControlName="color" class="color" /></label>
            <label>File<input type="file" /></label>
          </div>
        </section>
      </div>

      <div class="col">
        <section class="card pad">
          <h2>Select</h2>
          <label>Single select
            <select formControlName="country">
              <option value="">Choose a country…</option>
              @for (c of countries; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </label>
          <label>Multiple select
            <select multiple size="4" formControlName="interests">
              @for (i of interests; track i) { <option [value]="i">{{ i }}</option> }
            </select>
          </label>
        </section>

        <section class="card pad">
          <h2>Checkboxes &amp; switch</h2>
          <fieldset formGroupName="notify">
            <legend class="muted">Notify me about</legend>
            <label class="inline"><input type="checkbox" formControlName="email" /> Email updates</label>
            <label class="inline"><input type="checkbox" formControlName="sms" /> SMS alerts</label>
            <label class="inline"><input type="checkbox" formControlName="push" /> Push notifications</label>
          </fieldset>
          <label class="inline switch"><input type="checkbox" role="switch" formControlName="darkMode" /><span class="track"></span> Enable beta features</label>
          <label class="inline"><input type="checkbox" formControlName="terms" [class.invalid]="bad('terms')" /> I accept the terms and conditions</label>
          @if (bad('terms')) { <small class="err">You must accept the terms.</small> }
        </section>

        <section class="card pad">
          <h2>Radio buttons</h2>
          <fieldset>
            <legend class="muted">Plan</legend>
            @for (p of plans; track p) {
              <label class="inline"><input type="radio" formControlName="plan" [value]="p" /> {{ p }}</label>
            }
          </fieldset>
        </section>

        <section class="card pad">
          <h2>Range</h2>
          <label><span>Budget: <strong>{{ form.controls.budget.value }}</strong> USD</span>
            <input type="range" formControlName="budget" min="0" max="10000" step="100" />
          </label>
          <label><span>Risk level: <strong>{{ form.controls.risk.value }}</strong>/10</span>
            <input type="range" formControlName="risk" min="1" max="10" />
          </label>
        </section>

        <section class="card pad actions">
          <button type="submit" class="btn primary">Submit</button>
          <button type="button" class="btn" (click)="reset()">Reset</button>
        </section>

        @if (submitted(); as v) {
          <section class="card pad"><h2>Submitted values</h2><pre>{{ v | json }}</pre></section>
        }
      </div>
    </form>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; align-items: start; }
    .col { display: grid; gap: 20px; }
    .pad { padding: 20px; display: grid; gap: 14px; }
    h2 { font-size: 15px; font-weight: 600; }
    .row2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
    label { display: grid; gap: 6px; font-weight: 500; font-size: 13px; }
    input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]), textarea, select {
      width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
      border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    input:disabled { opacity: .55; cursor: not-allowed; }
    input.invalid { border-color: var(--red); }
    textarea { resize: vertical; }
    .color { width: 56px; height: 36px; padding: 2px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; }
    fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: 8px; }
    legend { padding: 0; margin-bottom: 4px; font-size: 13px; }
    .inline { display: flex; align-items: center; gap: 10px; font-weight: 400; }
    input[type=checkbox], input[type=radio], input[type=range] { accent-color: var(--primary); }
    input[type=checkbox], input[type=radio] { width: 16px; height: 16px; margin: 0; }
    input[type=range] { width: 100%; }
    .switch input { position: absolute; opacity: 0; }
    .track { width: 36px; height: 20px; border-radius: 99px; background: var(--border); position: relative; transition: background .15s; flex: none; }
    .track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; }
    .switch input:checked + .track { background: var(--primary); }
    .switch input:checked + .track::after { transform: translateX(16px); }
    .switch input:focus-visible + .track { box-shadow: 0 0 0 3px var(--primary-soft); }
    .err { color: var(--red); font-weight: 400; }
    .actions { grid-auto-flow: column; justify-content: start; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    pre { margin: 0; font-size: 12px; white-space: pre-wrap; color: var(--muted); }
    @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class Forms {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'];
  protected readonly interests = ['Investing', 'Budgeting', 'Crypto', 'Real estate', 'Savings'];
  protected readonly plans = ['Free', 'Pro', 'Enterprise'];
  protected readonly submitted = signal<unknown>(null);

  protected readonly form = this.fb.group({
    name: '', email: ['', [Validators.required, Validators.email]], password: '', phone: '', website: '',
    search: '', amount: 0, message: '', date: '', time: '', color: '#1b84ff',
    country: '', interests: [[] as string[]],
    notify: this.fb.group({ email: true, sms: false, push: false }),
    darkMode: false, terms: [false, Validators.requiredTrue],
    plan: 'Pro', budget: 2500, risk: 5,
  });

  protected bad(name: 'email' | 'terms') {
    const c = this.form.controls[name]; return c.invalid && (c.touched || c.dirty);
  }
  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) this.submitted.set(this.form.getRawValue());
  }
  protected reset() { this.form.reset(); this.submitted.set(null); }
}
