import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthShell } from '../core/auth-shell';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-shell>
      <form class="box" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Welcome back</h1>
        <p class="muted lead">Sign in to your Fin account</p>
  
        <label>Email
          <input type="email" formControlName="email" placeholder="you@company.com" autocomplete="email" [class.invalid]="bad('email')" />
          @if (bad('email')) { <small class="err">Enter a valid email address.</small> }
        </label>
  
        <label>
          <span class="lrow">Password <a routerLink="/forgot-password">Forgot password?</a></span>
          <span class="pw">
            <input [type]="show() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password" [class.invalid]="bad('password')" />
            <button type="button" class="eye" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'" [attr.aria-pressed]="show()">{{ show() ? 'Hide' : 'Show' }}</button>
          </span>
          @if (bad('password')) { <small class="err">Password must be at least 6 characters.</small> }
        </label>
  
        <label class="inline"><input type="checkbox" formControlName="remember" /> Remember me</label>
  
        <button class="btn primary" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
  
        <p class="muted foot">Don't have an account? <a routerLink="/signup">Sign up</a></p>
      </form>
    </app-auth-shell>
  `,
  styleUrl: './auth.scss',
})
export class Login {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly show = signal(false);
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: true,
  });

  protected bad(k: 'email' | 'password') { const c = this.form.controls[k]; return c.invalid && (c.touched || c.dirty); }

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    // Demo only: no backend yet. Replace with a real auth call.
    setTimeout(() => this.router.navigateByUrl('/overview'), 600);
  }
}
