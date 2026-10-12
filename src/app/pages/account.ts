import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

type Tab = 'profile' | 'password' | 'teams' | 'settings';

const match = (g: AbstractControl): ValidationErrors | null =>
  g.get('next')?.value === g.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card head">
      <div class="photo">
        @if (photo(); as src) { <img [src]="src" alt="Profile photo" /> } @else { <span>KM</span> }
        <label class="cam" title="Change photo">
          <input type="file" accept="image/*" (change)="pickPhoto($event)" aria-label="Upload profile photo" />
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z"/></svg>
        </label>
      </div>
      <div>
        <h2>{{ profile.controls.firstName.value }} {{ profile.controls.lastName.value }}</h2>
        <p class="muted">{{ profile.controls.jobTitle.value }} · {{ profile.controls.email.value }}</p>
      </div>
      @if (photo()) { <button class="btn" (click)="removePhoto()">Remove photo</button> }
    </section>

    <div class="tabs" role="tablist" aria-label="Account sections">
      @for (t of tabs; track t.id) {
        <button role="tab" [id]="'tab-' + t.id" [attr.aria-selected]="tab() === t.id" [attr.aria-controls]="'panel-' + t.id"
          [class.active]="tab() === t.id" (click)="tab.set(t.id)">{{ t.label }}</button>
      }
    </div>

    <section class="card pad" role="tabpanel" [id]="'panel-' + tab()" [attr.aria-labelledby]="'tab-' + tab()">
      @switch (tab()) {
        @case ('profile') {
          <form [formGroup]="profile" (ngSubmit)="save('Profile updated')" class="stack">
            <div class="row2">
              <label>First name<input formControlName="firstName" /></label>
              <label>Last name<input formControlName="lastName" /></label>
              <label>Email<input type="email" formControlName="email" [class.invalid]="profile.controls.email.invalid" />
                @if (profile.controls.email.invalid) { <small class="err">Enter a valid email address.</small> }</label>
              <label>Phone<input type="tel" formControlName="phone" /></label>
              <label>Job title<input formControlName="jobTitle" /></label>
              <label>Location<input formControlName="location" /></label>
            </div>
            <label>Bio<textarea rows="4" formControlName="bio"></textarea></label>
            <div class="actions"><button class="btn primary" [disabled]="profile.invalid">Save changes</button></div>
          </form>
        }
        @case ('password') {
          <form [formGroup]="password" (ngSubmit)="changePassword()" class="stack narrow">
            <label>Current password<input type="password" formControlName="current" autocomplete="current-password" /></label>
            <label>New password<input type="password" formControlName="next" autocomplete="new-password" />
              <small class="muted">At least 8 characters.</small></label>
            <label>Confirm new password<input type="password" formControlName="confirm" autocomplete="new-password" />
              @if (password.hasError('mismatch') && password.controls.confirm.dirty) { <small class="err">Passwords don't match.</small> }</label>
            <div class="actions"><button class="btn primary" [disabled]="password.invalid">Update password</button></div>
          </form>
        }
        @case ('teams') {
          <ul class="teams">
            @for (t of teams; track t.name) {
              <li>
                <span class="tlogo" [style.background]="t.color">{{ t.name[0] }}</span>
                <div><strong>{{ t.name }}</strong><br><small class="muted">{{ t.members }} members</small></div>
                <span class="role">{{ t.role }}</span>
              </li>
            }
          </ul>
        }
        @case ('settings') {
          <form [formGroup]="settings" (ngSubmit)="save('Settings saved')" class="stack narrow">
            <label>Language
              <select formControlName="language"><option>English</option><option>Kiswahili</option><option>Français</option></select></label>
            <label>Timezone
              <select formControlName="timezone"><option>Africa/Nairobi (UTC+3)</option><option>UTC</option><option>Europe/London</option></select></label>
            <label>Currency
              <select formControlName="currency"><option>USD</option><option>KES</option><option>EUR</option></select></label>
            <label class="inline"><input type="checkbox" formControlName="weekly" /> Weekly summary email</label>
            <label class="inline"><input type="checkbox" formControlName="twoFactor" /> Two-factor authentication</label>
            <div class="actions"><button class="btn primary">Save settings</button></div>
            <div class="danger">
              <div><strong>Delete account</strong><br><small class="muted">Permanently removes your account and data.</small></div>
              <button type="button" class="btn del" disabled title="Not connected to a backend yet">Delete</button>
            </div>
          </form>
        }
      }
    </section>

    @if (toast()) { <div class="toast" role="status">{{ toast() }}</div> }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 960px; }
    .head { display: flex; align-items: center; gap: 20px; padding: 24px; flex-wrap: wrap; }
    .head .btn { margin-left: auto; }
    .photo { position: relative; width: 88px; height: 88px; flex: none; }
    .photo img, .photo > span { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: var(--violet); color: #fff; display: grid; place-items: center; font-size: 28px; font-weight: 600; }
    .cam { position: absolute; right: -2px; bottom: -2px; width: 28px; height: 28px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: grid; place-items: center; cursor: pointer; }
    .cam:focus-within { outline: 2px solid var(--primary); }
    .cam input { position: absolute; inset: 0; opacity: 0; cursor: pointer; font-size: 0; }
    h2 { font-size: 20px; font-weight: 600; }
    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
    .tabs button { background: none; border: 0; padding: 10px 16px; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; font-weight: 500; }
    .tabs button:hover { color: var(--text); }
    .tabs button.active { color: var(--primary); border-color: var(--primary); }
    .pad { padding: 24px; }
    .stack { display: grid; gap: 16px; } .narrow { max-width: 440px; }
    .row2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    label { display: grid; gap: 6px; font-weight: 500; font-size: 13px; }
    input:not([type=checkbox]):not([type=file]), textarea, select { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none; }
    input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    input.invalid { border-color: var(--red); }
    .inline { display: flex; align-items: center; gap: 10px; font-weight: 400; }
    input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; margin: 0; }
    .err { color: var(--red); font-weight: 400; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .teams { list-style: none; margin: 0; padding: 0; display: grid; }
    .teams li { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--border); }
    .teams li:first-child { border-top: 0; padding-top: 0; }
    .tlogo { width: 40px; height: 40px; border-radius: 10px; color: #fff; display: grid; place-items: center; font-weight: 700; }
    .role { margin-left: auto; background: var(--primary-soft); color: var(--primary); padding: 2px 12px; border-radius: 99px; font-size: 12px; }
    .danger { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid var(--red); border-radius: 10px; margin-top: 8px; }
    .del { color: var(--red); border-color: var(--red); background: var(--red-soft); }
    .toast { position: fixed; right: 24px; bottom: 24px; background: var(--text); color: var(--bg); padding: 10px 16px; border-radius: 8px; box-shadow: 0 8px 24px rgb(0 0 0 / .3); }
  `,
})
export class Account implements OnDestroy {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile info' }, { id: 'password', label: 'Password' },
    { id: 'teams', label: 'Teams' }, { id: 'settings', label: 'Account settings' },
  ];
  protected readonly tab = signal<Tab>('profile');
  protected readonly photo = signal<string | null>(null);
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly teams = [
    { name: 'Finance', members: 8, role: 'Owner', color: '#1b84ff' },
    { name: 'Product Design', members: 12, role: 'Editor', color: '#7c5cfc' },
    { name: 'Engineering', members: 24, role: 'Viewer', color: '#14b8a6' },
    { name: 'Marketing', members: 6, role: 'Editor', color: '#f59e0b' },
  ];

  protected readonly profile = this.fb.group({
    firstName: ['Kenneth', Validators.required], lastName: ['Marete', Validators.required],
    email: ['kenneth@example.com', [Validators.required, Validators.email]], phone: '+254 700 000 000',
    jobTitle: 'Finance Lead', location: 'Nairobi, Kenya', bio: 'Keeping the numbers honest.',
  });
  protected readonly password = this.fb.group(
    { current: ['', Validators.required], next: ['', [Validators.required, Validators.minLength(8)]], confirm: ['', Validators.required] },
    { validators: match },
  );
  protected readonly settings = this.fb.group({
    language: 'English', timezone: 'Africa/Nairobi (UTC+3)', currency: 'USD', weekly: true, twoFactor: false,
  });

  protected pickPhoto(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    this.revoke(); this.photo.set(URL.createObjectURL(file));
  }
  protected removePhoto() { this.revoke(); this.photo.set(null); }
  protected changePassword() { this.password.reset(); this.save('Password updated'); }
  protected save(msg: string) {
    this.toast.set(msg); clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2500);
  }
  ngOnDestroy() { this.revoke(); clearTimeout(this.toastTimer); }
  private revoke() { const p = this.photo(); if (p) URL.revokeObjectURL(p); }
}
