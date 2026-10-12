import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drawer } from '../core/drawer';
import { ALL_PERMS, MODULES, Module, Role, UserService, permKey } from '../core/users';

@Component({
  selector: 'app-roles',
  imports: [FormsModule, Drawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <div><h2>Roles</h2><p class="muted">{{ svc.roleNames().length }} roles · define what each group of users can do</p></div>
      <button class="btn primary" (click)="openNew()">＋ New role</button>
    </div>

    <div class="grid">
      @for (r of svc.roleNames(); track r) {
        <article class="card role">
          <div class="top">
            <h3>{{ r }}</h3>
            @if (svc.isBuiltIn(r)) { <span class="tag">Built-in</span> }
          </div>
          <p class="muted desc">{{ svc.roleDescriptions()[r] || 'No description.' }}</p>
          <dl>
            <div><dt>Users</dt><dd>{{ svc.userCount(r) }}</dd></div>
            <div><dt>Permissions</dt><dd>{{ svc.roleTemplates()[r].length }} / {{ total }}</dd></div>
          </dl>
          <div class="bar" role="progressbar" [attr.aria-valuenow]="svc.roleTemplates()[r].length" aria-valuemin="0" [attr.aria-valuemax]="total" [attr.aria-label]="r + ' permissions'"><i [style.width.%]="svc.roleTemplates()[r].length / total * 100"></i></div>
          <div class="acts">
            <button class="btn sm" (click)="openEdit(r)" [disabled]="r === 'Admin'" [title]="r === 'Admin' ? 'Admin always has every permission' : ''">Edit</button>
            <button class="btn sm del" (click)="deleting.set(r)" [disabled]="svc.isBuiltIn(r) || svc.userCount(r) > 0"
              [title]="svc.isBuiltIn(r) ? 'Built-in roles can\\'t be deleted' : svc.userCount(r) ? 'Reassign its users first' : 'Delete role'">Delete</button>
          </div>
        </article>
      }
    </div>

    <app-drawer [heading]="editing() === null ? 'New role' : 'Edit ' + editing()" [(open)]="drawerOpen">
      <div class="form">
        <label>Role name<input [ngModel]="name()" (ngModelChange)="name.set($event)" [class.invalid]="!!error()" placeholder="e.g. Accountant" /></label>
        @if (error()) { <small class="err" role="alert">{{ error() }}</small> }
        <label>Description<textarea rows="2" [ngModel]="desc()" (ngModelChange)="desc.set($event)" placeholder="What is this role for?"></textarea></label>

        <div class="ph"><strong>Permissions</strong><span class="muted">{{ perms().size }} selected</span>
          <span class="sp"></span><button type="button" class="link" (click)="perms.set(allSet())">All</button><button type="button" class="link" (click)="perms.set(emptySet())">None</button></div>
        @for (m of modules; track m.key) {
          <fieldset>
            <legend><label class="inline"><input type="checkbox" [checked]="allIn(m)" [indeterminate]="someIn(m)" (change)="toggleModule(m, $any($event.target).checked)" /> <strong>{{ m.label }}</strong></label></legend>
            <div class="acts2">@for (a of m.actions; track a.key) {
              <label class="inline"><input type="checkbox" [checked]="perms().has(key(m, a.key))" (change)="toggle(key(m, a.key), $any($event.target).checked)" /> {{ a.label }}</label>
            }</div>
          </fieldset>
        }
      </div>
      <div drawer-footer class="foot"><button class="btn" (click)="drawerOpen.set(false)">Cancel</button><button class="btn primary" (click)="save()">{{ editing() === null ? 'Create role' : 'Save role' }}</button></div>
    </app-drawer>

    @if (deleting(); as d) {
      <div class="overlay" (click)="deleting.set(null)">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-label="Confirm delete" (click)="$event.stopPropagation()">
          <h3>Delete the {{ d }} role?</h3><p class="muted">This can't be undone.</p>
          <div class="foot"><button class="btn" (click)="deleting.set(null)">Cancel</button><button class="btn danger" (click)="confirmDelete()">Delete</button></div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; } h2 { font-size: 18px; font-weight: 600; } h3 { font-size: 15px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .role { padding: 20px; display: grid; gap: 12px; align-content: start; } .top { display: flex; justify-content: space-between; align-items: center; }
    .tag { font-size: 11px; padding: 1px 8px; border-radius: 99px; background: var(--surface-2); color: var(--muted); } .desc { min-height: 42px; font-size: 13px; }
    dl { display: flex; gap: 28px; margin: 0; } dt { font-size: 12px; color: var(--muted); } dd { margin: 0; font-weight: 600; font-size: 18px; }
    .bar { height: 6px; border-radius: 99px; background: var(--surface-2); overflow: hidden; } .bar i { display: block; height: 100%; background: var(--primary); border-radius: inherit; }
    .acts { display: flex; gap: 8px; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); } .btn.sm { padding: 5px 14px; font-size: 13px; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .btn.del { color: var(--red); } .btn.danger { background: var(--red); border-color: var(--red); color: #fff; } .btn:disabled { opacity: .4; cursor: not-allowed; }
    .form { display: grid; gap: 14px; } label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; }
    input:not([type=checkbox]), textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none; } input:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .invalid { border-color: var(--red) !important; } .err { color: var(--red); margin-top: -8px; }
    .ph { display: flex; align-items: center; gap: 10px; } .sp { flex: 1; } .link { border: 0; background: none; color: var(--primary); font-size: 13px; padding: 2px 6px; }
    fieldset { margin: 0; border: 1px solid var(--border); border-radius: 10px; padding: 4px 14px 12px; } legend { padding: 0 6px; } .acts2 { display: flex; flex-wrap: wrap; gap: 8px 18px; }
    .inline { display: flex; align-items: center; gap: 8px; font-weight: 400; } legend .inline { font-weight: 500; } input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; margin: 0; }
    .foot { display: flex; gap: 10px; justify-content: flex-end; }
    .overlay { position: fixed; inset: 0; background: rgb(0 0 0 / .55); display: grid; place-items: center; z-index: 50; padding: 16px; } .modal { width: 100%; max-width: 400px; padding: 24px; display: grid; gap: 12px; }
  `,
})
export class Roles {
  protected readonly svc = inject(UserService);
  protected readonly modules = MODULES; protected readonly total = ALL_PERMS.length;
  protected readonly drawerOpen = signal(false);
  protected readonly editing = signal<Role | null>(null);
  protected readonly deleting = signal<Role | null>(null);
  protected readonly name = signal(''); protected readonly desc = signal(''); protected readonly error = signal('');
  protected readonly perms = signal<ReadonlySet<string>>(new Set());

  protected key(m: Module, a: string) { return permKey(m, { key: a }); }
  protected allSet() { return new Set(ALL_PERMS); } protected emptySet() { return new Set<string>(); }
  protected allIn(m: Module) { return m.actions.every(a => this.perms().has(this.key(m, a.key))); }
  protected someIn(m: Module) { return !this.allIn(m) && m.actions.some(a => this.perms().has(this.key(m, a.key))); }
  protected toggle(p: string, on: boolean) { this.perms.update(s => { const n = new Set(s); if (on) n.add(p); else n.delete(p); return n; }); }
  protected toggleModule(m: Module, on: boolean) { m.actions.forEach(a => this.toggle(this.key(m, a.key), on)); }

  protected openNew() { this.editing.set(null); this.name.set(''); this.desc.set(''); this.error.set(''); this.perms.set(new Set(this.svc.roleTemplates()['Viewer'])); this.drawerOpen.set(true); }
  protected openEdit(r: Role) { this.editing.set(r); this.name.set(r); this.desc.set(this.svc.roleDescriptions()[r] ?? ''); this.error.set(''); this.perms.set(new Set(this.svc.roleTemplates()[r])); this.drawerOpen.set(true); }
  protected save() {
    const err = this.svc.saveRole(this.editing(), this.name(), this.desc(), [...this.perms()]);
    if (err) { this.error.set(err); return; }
    this.drawerOpen.set(false);
  }
  protected confirmDelete() { const d = this.deleting(); if (d) this.svc.removeRole(d); this.deleting.set(null); }
}
