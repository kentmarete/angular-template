import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ALL_PERMS, MODULES, Module, Role, USER_STATUSES, User, UserService, permKey } from '../core/users';

@Component({
  selector: 'app-user-edit',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user()) {
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="bar">
          <div><h2>{{ isNew() ? 'Add user' : 'Edit user' }}</h2><p class="muted">{{ granted().size }} of {{ total }} permissions</p></div>
          <span class="sp"></span>
          <a class="btn" routerLink="/users">Cancel</a>
          <button class="btn primary" type="submit">{{ isNew() ? 'Add user' : 'Save changes' }}</button>
        </div>

        <section class="card pad">
          <h3>Profile</h3>
          <div class="row2">
            <label>Full name<input formControlName="name" [class.invalid]="bad('name')" />@if (bad('name')) { <small class="err">Name is required.</small> }</label>
            <label>Email<input type="email" formControlName="email" [class.invalid]="bad('email')" />@if (bad('email')) { <small class="err">Enter a valid email.</small> }</label>
            <label>Status<select formControlName="status">@for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }</select></label>
            <label>Role
              <select formControlName="role" (change)="applyRole()">@for (r of svc.roleNames(); track r) { <option [value]="r">{{ r }}</option> }</select>
              <small class="muted">Selecting a role resets permissions to its defaults.</small></label>
          </div>
        </section>

        <section class="card pad">
          <div class="ph"><h3>Permissions</h3>
            @if (custom()) { <span class="custom">Custom — differs from {{ form.controls.role.value }} defaults</span> }
            <span class="sp"></span>
            <button type="button" class="link" (click)="applyRole()" [disabled]="!custom()">Reset to role defaults</button>
            <button type="button" class="link" (click)="setAll(true)">Select all</button>
            <button type="button" class="link" (click)="setAll(false)">Clear</button>
          </div>
          <div class="mods">
            @for (m of modules; track m.key) {
              <fieldset>
                <legend>
                  <label class="inline"><input type="checkbox" [checked]="allIn(m)" [indeterminate]="someIn(m)" (change)="toggleModule(m, $any($event.target).checked)" /> <strong>{{ m.label }}</strong></label>
                </legend>
                @for (a of m.actions; track a.key) {
                  <label class="inline"><input type="checkbox" [checked]="granted().has(key(m, a.key))" (change)="toggle(key(m, a.key), $any($event.target).checked)" /> {{ a.label }}</label>
                }
              </fieldset>
            }
          </div>
        </section>
      </form>
    } @else {
      <section class="card empty"><h2>User not found</h2><a class="btn primary" routerLink="/users">Back to users</a></section>
    }
  `,
  styles: `
    :host { display: block; max-width: 900px; } form { display: grid; gap: 20px; }
    .bar, .ph { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .sp { flex: 1; } h2 { font-size: 18px; font-weight: 600; } h3 { font-size: 14px; font-weight: 600; }
    .pad { padding: 20px; display: grid; gap: 14px; } .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; }
    input:not([type=checkbox]), select { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none; } input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .invalid { border-color: var(--red) !important; } .err { color: var(--red); font-weight: 400; } small { font-weight: 400; }
    .custom { font-size: 12px; padding: 2px 10px; border-radius: 99px; background: var(--primary-soft); color: var(--primary); }
    .link { border: 0; background: none; color: var(--primary); font-size: 13px; padding: 4px 6px; } .link:disabled { color: var(--muted); cursor: default; } .link:hover:not(:disabled) { text-decoration: underline; }
    .mods { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
    fieldset { margin: 0; border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px 14px; display: grid; gap: 8px; align-content: start; } legend { padding: 0 6px; }
    .inline { display: flex; align-items: center; gap: 8px; font-weight: 400; } legend .inline { font-weight: 500; }
    input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; margin: 0; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .empty { padding: 48px; text-align: center; display: grid; gap: 12px; justify-items: center; }
    @media (max-width: 700px) { .row2 { grid-template-columns: 1fr; } }
  `,
})
export class UserEdit {
  /** Route param: a user id, or "new". */
  readonly id = input<string>();
  protected readonly svc = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly statuses = USER_STATUSES; protected readonly modules = MODULES; protected readonly total = ALL_PERMS.length;
  protected readonly user = signal<User | null>(null);
  protected readonly isNew = signal(false);
  protected readonly granted = signal<ReadonlySet<string>>(new Set());
  protected readonly form = this.fb.group({
    name: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    role: 'Viewer' as Role, status: 'Active' as User['status'],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        const u = id === 'new' ? this.svc.blank() : (this.svc.get(Number(id)) ?? null);
        this.isNew.set(id === 'new'); this.user.set(u);
        if (u) { this.form.reset({ name: u.name, email: u.email, role: u.role, status: u.status }); this.granted.set(new Set(u.permissions)); }
      });
    });
  }

  protected key(m: Module, a: string) { return permKey(m, { key: a }); }
  protected bad(k: 'name' | 'email') { const c = this.form.controls[k]; return c.invalid && (c.touched || c.dirty); }
  protected custom() { return this.svc.isCustom({ role: this.form.controls.role.value, permissions: [...this.granted()] }); }
  protected allIn(m: Module) { return m.actions.every(a => this.granted().has(this.key(m, a.key))); }
  protected someIn(m: Module) { return !this.allIn(m) && m.actions.some(a => this.granted().has(this.key(m, a.key))); }

  protected applyRole() { this.granted.set(new Set(this.svc.roleTemplates()[this.form.controls.role.value])); }
  protected setAll(on: boolean) { this.granted.set(new Set(on ? ALL_PERMS : [])); }
  protected toggle(p: string, on: boolean) { this.granted.update(s => { const n = new Set(s); if (on) n.add(p); else n.delete(p); return n; }); }
  protected toggleModule(m: Module, on: boolean) { m.actions.forEach(a => this.toggle(this.key(m, a.key), on)); }

  protected save() {
    this.form.markAllAsTouched();
    const u = this.user(); if (this.form.invalid || !u) return;
    this.svc.save({ ...u, ...this.form.getRawValue(), permissions: ALL_PERMS.filter(p => this.granted().has(p)) });
    this.router.navigateByUrl('/users');
  }
}
