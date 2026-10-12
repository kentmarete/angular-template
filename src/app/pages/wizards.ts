import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Step, Stepper } from '../core/stepper';

const ICON = {
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l2-3h12M16 14h2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
};

@Component({
  selector: 'app-wizards',
  imports: [ReactiveFormsModule, Stepper, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Wizard 1: numbered -->
    <section class="card wiz">
      <header><h2>Business setup</h2><p class="muted">Numbered steps</p></header>
      <app-stepper [steps]="setupSteps" [current]="s1()" mode="number" (pick)="s1.set($event)" />

      <div class="body">
        @if (done1()) {
          <div class="done"><span class="ok">✓</span><h3>You're all set, {{ account.controls.name.value }}!</h3>
            <p class="muted">{{ business.controls.company.value }} has been created.</p>
            <button class="btn" (click)="reset1()">Start over</button></div>
        } @else {
          @switch (s1()) {
            @case (0) {
              <form [formGroup]="account" class="fields">
                <label>Your name<input formControlName="name" placeholder="Jane Doe" [class.invalid]="bad(account, 'name')" />
                  @if (bad(account, 'name')) { <small class="err">Name is required.</small> }</label>
                <label>Work email<input type="email" formControlName="email" placeholder="jane@company.com" [class.invalid]="bad(account, 'email')" />
                  @if (bad(account, 'email')) { <small class="err">Enter a valid email.</small> }</label>
              </form>
            }
            @case (1) {
              <form [formGroup]="business" class="fields">
                <label>Company name<input formControlName="company" [class.invalid]="bad(business, 'company')" />
                  @if (bad(business, 'company')) { <small class="err">Company name is required.</small> }</label>
                <label>Industry<select formControlName="industry"><option>Finance</option><option>Retail</option><option>Technology</option><option>Healthcare</option></select></label>
                <fieldset><legend>Team size</legend>
                  @for (n of sizes; track n) { <label class="inline"><input type="radio" formControlName="size" [value]="n" /> {{ n }}</label> }
                </fieldset>
              </form>
            }
            @case (2) {
              <dl class="review">
                <dt>Name</dt><dd>{{ account.controls.name.value }}</dd>
                <dt>Email</dt><dd>{{ account.controls.email.value }}</dd>
                <dt>Company</dt><dd>{{ business.controls.company.value }}</dd>
                <dt>Industry</dt><dd>{{ business.controls.industry.value }}</dd>
                <dt>Team size</dt><dd>{{ business.controls.size.value }}</dd>
              </dl>
            }
          }
        }
      </div>

      @if (!done1()) {
        <footer>
          <button class="btn" (click)="back1()" [disabled]="s1() === 0">Back</button>
          <button class="btn primary" (click)="next1()">{{ s1() === 2 ? 'Finish' : 'Continue' }}</button>
        </footer>
      }
    </section>

    <!-- Wizard 2: icons -->
    <section class="card wiz">
      <header><h2>Send money</h2><p class="muted">Icon steps</p></header>
      <app-stepper [steps]="sendSteps" [current]="s2()" mode="icon" (pick)="s2.set($event)" />

      <div class="body">
        @if (done2()) {
          <div class="done"><span class="ok">✓</span><h3>Transfer sent</h3>
            <p class="muted">{{ transfer.controls.amount.value | currency }} to {{ recipient.controls.name.value }}</p>
            <button class="btn" (click)="reset2()">Send another</button></div>
        } @else {
          @switch (s2()) {
            @case (0) {
              <form [formGroup]="recipient" class="fields">
                <label>Recipient name<input formControlName="name" [class.invalid]="bad(recipient, 'name')" />
                  @if (bad(recipient, 'name')) { <small class="err">Recipient is required.</small> }</label>
                <label>Account number<input formControlName="account" inputmode="numeric" placeholder="10 digits" [class.invalid]="bad(recipient, 'account')" />
                  @if (bad(recipient, 'account')) { <small class="err">Enter a 10-digit account number.</small> }</label>
              </form>
            }
            @case (1) {
              <form [formGroup]="transfer" class="fields">
                <label>Amount (USD)<input type="number" formControlName="amount" min="1" [class.invalid]="bad(transfer, 'amount')" />
                  @if (bad(transfer, 'amount')) { <small class="err">Enter an amount greater than 0.</small> }</label>
                <label>Speed
                  <select formControlName="speed"><option value="standard">Standard (2–3 days, free)</option><option value="instant">Instant (1% fee)</option></select></label>
                <label>Note<textarea rows="2" formControlName="note" placeholder="Optional"></textarea></label>
              </form>
            }
            @case (2) {
              <dl class="review">
                <dt>To</dt><dd>{{ recipient.controls.name.value }} · ••••{{ last4() }}</dd>
                <dt>Amount</dt><dd>{{ transfer.controls.amount.value | currency }}</dd>
                <dt>Fee</dt><dd>{{ fee() | currency }}</dd>
                <dt>Total</dt><dd><strong>{{ total() | currency }}</strong></dd>
              </dl>
              <label class="inline"><input type="checkbox" [checked]="confirmed()" (change)="confirmed.set(!confirmed())" /> I confirm these details are correct</label>
            }
          }
        }
      </div>

      @if (!done2()) {
        <footer>
          <button class="btn" (click)="back2()" [disabled]="s2() === 0">Back</button>
          <button class="btn primary" (click)="next2()" [disabled]="s2() === 2 && !confirmed()">{{ s2() === 2 ? 'Send' : 'Continue' }}</button>
        </footer>
      }
    </section>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    .wiz { padding: 24px; display: grid; gap: 24px; }
    header { display: flex; align-items: baseline; gap: 12px; } h2 { font-size: 16px; font-weight: 600; } h3 { font-size: 18px; }
    .body { min-height: 190px; padding-top: 4px; }
    .fields { display: grid; gap: 16px; max-width: 460px; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; }
    input:not([type=checkbox]):not([type=radio]), select, textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none; }
    input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .invalid { border-color: var(--red) !important; } .err { color: var(--red); font-weight: 400; }
    fieldset { border: 0; padding: 0; margin: 0; display: flex; gap: 18px; flex-wrap: wrap; } legend { font-size: 13px; font-weight: 500; margin-bottom: 8px; padding: 0; width: 100%; }
    .inline { display: flex; align-items: center; gap: 8px; font-weight: 400; }
    input[type=checkbox], input[type=radio] { accent-color: var(--primary); width: 16px; height: 16px; margin: 0; }
    .review { display: grid; grid-template-columns: 120px 1fr; gap: 10px 16px; margin: 0 0 16px; max-width: 460px; }
    .review dt { color: var(--muted); } .review dd { margin: 0; }
    .done { display: grid; justify-items: center; gap: 8px; text-align: center; padding: 24px 0; }
    .ok { width: 52px; height: 52px; border-radius: 50%; background: var(--green-soft); color: var(--green); display: grid; place-items: center; font-size: 26px; }
    footer { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 16px; }
    .btn { padding: 9px 20px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn:disabled { opacity: .45; cursor: not-allowed; }
  `,
})
export class Wizards {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly sizes = ['1–10', '11–50', '51–200', '200+'];

  // Wizard 1 — numbered
  protected readonly setupSteps: Step[] = [{ label: 'Account', hint: 'About you' }, { label: 'Business', hint: 'Your company' }, { label: 'Review', hint: 'Confirm' }];
  protected readonly s1 = signal(0); protected readonly done1 = signal(false);
  protected readonly account = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]] });
  protected readonly business = this.fb.group({ company: ['', Validators.required], industry: 'Finance', size: '1–10' });

  // Wizard 2 — icons
  protected readonly sendSteps: Step[] = [{ label: 'Recipient', hint: 'Who to pay', icon: ICON.user }, { label: 'Amount', hint: 'How much', icon: ICON.wallet }, { label: 'Confirm', hint: 'Review & send', icon: ICON.shield }];
  protected readonly s2 = signal(0); protected readonly done2 = signal(false); protected readonly confirmed = signal(false);
  protected readonly recipient = this.fb.group({ name: ['', Validators.required], account: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]] });
  protected readonly transfer = this.fb.group({ amount: [0, [Validators.required, Validators.min(1)]], speed: 'standard', note: '' });

  protected last4() { return this.recipient.controls.account.value.slice(-4); }
  protected fee() { return this.transfer.controls.speed.value === 'instant' ? (Number(this.transfer.controls.amount.value) || 0) * 0.01 : 0; }
  protected total() { return (Number(this.transfer.controls.amount.value) || 0) + this.fee(); }

  protected bad(g: { controls: Record<string, { invalid: boolean; touched: boolean }> }, k: string) { const c = g.controls[k]; return c.invalid && c.touched; }

  protected next1() {
    const g = [this.account, this.business][this.s1()];
    if (g) { g.markAllAsTouched(); if (g.invalid) return; }
    if (this.s1() === 2) this.done1.set(true); else this.s1.update(n => n + 1);
  }
  protected back1() { this.s1.update(n => Math.max(0, n - 1)); }
  protected reset1() { this.account.reset(); this.business.reset(); this.s1.set(0); this.done1.set(false); }

  protected next2() {
    const g = [this.recipient, this.transfer][this.s2()];
    if (g) { g.markAllAsTouched(); if (g.invalid) return; }
    if (this.s2() === 2) this.done2.set(true); else this.s2.update(n => n + 1);
  }
  protected back2() { this.s2.update(n => Math.max(0, n - 1)); }
  protected reset2() { this.recipient.reset(); this.transfer.reset(); this.s2.set(0); this.done2.set(false); this.confirmed.set(false); }
}
