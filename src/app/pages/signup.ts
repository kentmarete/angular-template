import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AuthShell } from '../core/auth-shell';

const match = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-shell>
      <form class="box" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Create your account</h1>
        <p class="muted lead">Start tracking your finances in minutes</p>

        <label>Full name
          <input type="text" formControlName="name" placeholder="Jane Doe" autocomplete="name" [class.invalid]="bad('name')" />
          @if (bad('name')) { <small class="err">Please enter your name.</small> }
        </label>

        <label>Email
          <input type="email" formControlName="email" placeholder="you@company.com" autocomplete="email" [class.invalid]="bad('email')" />
          @if (bad('email')) { <small class="err">Enter a valid email address.</small> }
        </label>

        <label>Password
          <span class="pw">
            <input [type]="show() ? 'text' : 'password'" formControlName="password" placeholder="At least 8 characters" autocomplete="new-password" [class.invalid]="bad('password')" />
            <button type="button" class="eye" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'" [attr.aria-pressed]="show()">{{ show() ? 'Hide' : 'Show' }}</button>
          </span>
          <span class="meter" [class]="'meter s' + strength()" aria-hidden="true">
            @for (i of [1, 2, 3, 4]; track i) { <i [class.on]="i <= strength()"></i> }
          </span>
          @if (bad('password')) { <small class="err">Password must be at least 8 characters.</small> }
        </label>

        <label>Confirm password
          <input [type]="show() ? 'text' : 'password'" formControlName="confirm" placeholder="Repeat your password" autocomplete="new-password"
            [class.invalid]="form.hasError('mismatch') && form.controls.confirm.dirty" />
          @if (form.hasError('mismatch') && form.controls.confirm.dirty) { <small class="err">Passwords don't match.</small> }
        </label>

        <label class="inline"><input type="checkbox" formControlName="terms" /> <span>I agree to the <a href="#" (click)="$event.preventDefault()">Terms</a> and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a></span></label>
        @if (bad('terms')) { <small class="err">You must accept the terms to continue.</small> }

        <button class="btn" type="submit" [disabled]="busy()">{{ busy() ? 'Creating account…' : 'Create account' }}</button>

        <p class="muted foot">Already have an account? <a routerLink="/login">Sign in</a></p>
      </form>
    </app-auth-shell>
  `,
  styleUrl: './auth.scss',
})
export class Signup {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly show = signal(false);
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    { validators: match },
  );

  private readonly pw = toSignal(this.form.controls.password.valueChanges.pipe(startWith('')), { initialValue: '' });
  /** 0-4: length, mixed case, digit, symbol. */
  protected readonly strength = computed(() => {
    const p = this.pw(); if (!p) return 0;
    return [p.length >= 8, /[a-z]/.test(p) && /[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  });

  protected bad(k: 'name' | 'email' | 'password' | 'terms') { const c = this.form.controls[k]; return c.invalid && (c.touched || c.dirty); }

  protected submit() {
    this.form.markAllAsTouched();
    this.form.controls.confirm.markAsDirty();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    // Demo only: no backend yet. Replace with a real registration call.
    setTimeout(() => this.router.navigateByUrl('/overview'), 700);
  }
}
