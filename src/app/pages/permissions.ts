import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MODULES, Module, Role, UserService, permKey } from '../core/users';

@Component({
  selector: 'app-permissions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <header><h2>Roles &amp; permissions</h2>
        <p class="muted">Choose what each role can do. These are the defaults applied when you assign a role to a user. Changes apply immediately.</p></header>
      <div class="scroll">
        <table>
          <thead>
            <tr><th>Permission</th>@for (r of svc.roleNames(); track r) { <th class="c">{{ r }}<br><small class="muted">{{ count(r) }} granted</small></th> }</tr>
          </thead>
          <tbody>
            @for (m of modules; track m.key) {
              <tr class="mod">
                <td><strong>{{ m.label }}</strong></td>
                @for (r of svc.roleNames(); track r) {
                  <td class="c"><input type="checkbox" [checked]="all(r, m)" [indeterminate]="some(r, m)" [disabled]="r === 'Admin'" (change)="toggleModule(r, m, $any($event.target).checked)" [attr.aria-label]="'All ' + m.label + ' for ' + r" /></td>
                }
              </tr>
              @for (a of m.actions; track a.key) {
                <tr>
                  <td class="perm">{{ a.label }} {{ m.label.toLowerCase() }}</td>
                  @for (r of svc.roleNames(); track r) {
                    <td class="c"><input type="checkbox" [checked]="has(r, m, a.key)" [disabled]="r === 'Admin'" (change)="svc.setRolePerm(r, key(m, a.key), $any($event.target).checked)" [attr.aria-label]="a.label + ' ' + m.label + ' for ' + r" /></td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <footer class="muted">Admin always has every permission and can't be edited.</footer>
    </div>
  `,
  styles: `
    header { padding: 16px 20px; display: grid; gap: 2px; } h2 { font-size: 16px; font-weight: 600; } footer { padding: 12px 20px; font-size: 12px; border-top: 1px solid var(--border); }
    .scroll { overflow-x: auto; position: relative; } table { width: 100%; border-collapse: collapse; }
    th { font-weight: 600; padding: 12px 20px; border-block: 1px solid var(--border); background: var(--surface-2); text-align: left; } th small { font-weight: 400; }
    td { padding: 10px 20px; border-bottom: 1px solid var(--border); } .c { text-align: center; } .perm { padding-left: 36px; color: var(--muted); }
    tr.mod td { background: color-mix(in srgb, var(--surface-2) 55%, transparent); }
    input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer; } input:disabled { opacity: .55; cursor: not-allowed; }
  `,
})
export class Permissions {
  protected readonly svc = inject(UserService);
  protected readonly modules = MODULES;
  protected key(m: Module, a: string) { return permKey(m, { key: a }); }
  protected has(r: Role, m: Module, a: string) { return this.svc.roleTemplates()[r].includes(this.key(m, a)); }
  protected all(r: Role, m: Module) { return m.actions.every(a => this.has(r, m, a.key)); }
  protected some(r: Role, m: Module) { return !this.all(r, m) && m.actions.some(a => this.has(r, m, a.key)); }
  protected count(r: Role) { return this.svc.roleTemplates()[r].length; }
  protected toggleModule(r: Role, m: Module, on: boolean) { m.actions.forEach(a => this.svc.setRolePerm(r, this.key(m, a.key), on)); }
}
