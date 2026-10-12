import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthShell } from '../core/auth-shell';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-shell>
      @if (sentTo(); as email) {
        <div class="box sent" role="status">
          <span class="ok">✉</span>
          <h1>Check your email</h1>
          <p class="muted lead">If an account exists for <strong>{{ email }}</strong>, we've sent a link to reset your password.</p>
          <button class="btn" type="button" (click)="resend()" [disabled]="cooldown() > 0">
            {{ cooldown() > 0 ? 'Resend in ' + cooldown() + 's' : 'Resend email' }}
          </button>
          <p class="muted foot"><a href="#" (click)="$event.preventDefault(); sentTo.set(null)">Use a different email</a> · <a routerLink="/login">Back to sign in</a></p>
        </div>
      } @else {
        <form class="box" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h1>Forgot password?</h1>
          <p class="muted lead">Enter your email and we'll send you a link to reset it.</p>

          <label>Email
            <input type="email" formControlName="email" placeholder="you@company.com" autocomplete="email" [class.invalid]="bad()" />
            @if (bad()) { <small class="err">Enter a valid email address.</small> }
          </label>

          <button class="btn" type="submit" [disabled]="busy()">{{ busy() ? 'Sending…' : 'Send reset link' }}</button>

          <p class="muted foot">Remembered it? <a routerLink="/login">Back to sign in</a></p>
        </form>
      }
    </app-auth-shell>
  `,
  styleUrl: './auth.scss',
  styles: `
    .sent { justify-items: center; text-align: center; }
    .ok { width: 56px; height: 56px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; font-size: 24px; }
    .sent .lead { margin-top: -6px; }
    .btn { width: 100%; } .sent .btn { background: var(--surface-2); color: var(--text); border-color: var(--border); }
  `,
})
export class ForgotPassword implements OnDestroy {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly busy = signal(false);
  protected readonly sentTo = signal<string | null>(null);
  protected readonly cooldown = signal(0);
  protected readonly form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  private timer?: ReturnType<typeof setInterval>;

  protected bad() { const c = this.form.controls.email; return c.invalid && (c.touched || c.dirty); }

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    // Demo only: no backend yet. Replace with a real password-reset request.
    setTimeout(() => { this.busy.set(false); this.sentTo.set(this.form.controls.email.value); this.startCooldown(); }, 700);
  }
  protected resend() { this.startCooldown(); }

  ngOnDestroy() { clearInterval(this.timer); }

  private startCooldown() {
    clearInterval(this.timer); this.cooldown.set(30);
    this.timer = setInterval(() => { this.cooldown.update(n => n - 1); if (this.cooldown() <= 0) clearInterval(this.timer); }, 1000);
  }
}
