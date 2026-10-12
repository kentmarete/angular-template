import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_PERMS, User, UserService } from '../core/users';

const COLORS = ['#1b84ff', '#7c5cfc', '#14b8a6', '#f59e0b', '#ec4899', '#17a34a', '#e5484d'];

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'deleting.set(null)' },
  template: `
    <div class="card">
      <header>
        <div><h2>Users</h2><p class="muted">{{ rows().length }} of {{ svc.users().length }} users</p></div>
        <div class="tools">
          <input type="search" placeholder="Search name or email…" aria-label="Search users" (input)="query.set($any($event.target).value)" />
          <select aria-label="Role" (change)="role.set($any($event.target).value)"><option value="">All roles</option>@for (r of svc.roleNames(); track r) { <option [value]="r">{{ r }}</option> }</select>
          <a class="btn primary" routerLink="/users/new/edit">＋ Add user</a>
        </div>
      </header>
      <div class="scroll">
        <table>
          <thead><tr><th>User</th><th class="hide-sm">Role</th><th class="hide-sm">Status</th><th class="hide-sm">Permissions</th><th class="hide-sm">Last active</th><th class="act"><span class="sr">Actions</span></th></tr></thead>
          <tbody>
            @for (u of rows(); track u.id) {
              <tr>
                <td><a class="who" [routerLink]="['/users', u.id, 'edit']"><span class="av" [style.background]="color(u)">{{ initials(u) }}</span><span><strong>{{ u.name }}</strong><br><small class="muted">{{ u.email }}</small><small class="muted show-sm">{{ u.role }} · {{ u.status }}</small></span></a></td>
                <td class="hide-sm"><span class="role">{{ u.role }}</span>@if (svc.isCustom(u)) { <span class="custom" title="Differs from the {{ u.role }} role defaults">Custom</span> }</td>
                <td class="hide-sm"><span class="badge {{ u.status }}">{{ u.status }}</span></td>
                <td class="muted hide-sm">{{ u.permissions.length }} / {{ total }}</td>
                <td class="muted hide-sm">{{ u.lastActive }}</td>
                <td class="act nowrap">
                  <a class="ib" [routerLink]="['/users', u.id, 'edit']" [attr.aria-label]="'Edit ' + u.name" title="Edit &amp; permissions">✎</a>
                  <button class="ib del" (click)="deleting.set(u)" [disabled]="u.id === 1" [attr.aria-label]="'Delete ' + u.name" [title]="u.id === 1 ? 'You can\\'t delete yourself' : 'Delete'">🗑</button>
                </td>
              </tr>
            } @empty { <tr><td colspan="6" class="muted empty">No users found.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>

    @if (deleting(); as d) {
      <div class="overlay" (click)="deleting.set(null)">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-label="Confirm delete" (click)="$event.stopPropagation()">
          <h3>Remove {{ d.name }}?</h3><p class="muted">They will lose access immediately.</p>
          <div class="foot"><button class="btn" (click)="deleting.set(null)">Cancel</button><button class="btn del" (click)="confirm()">Remove</button></div>
        </div>
      </div>
    }
  `,
  styles: `
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; flex-wrap: wrap; } h2 { font-size: 16px; font-weight: 600; } h3 { font-size: 16px; }
    .tools { display: flex; gap: 10px; flex-wrap: wrap; }
    input, select { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 8px 12px; font: inherit; outline: none; } input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .scroll { overflow-x: auto; position: relative; } table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 10px 20px; border-block: 1px solid var(--border); background: var(--surface-2); white-space: nowrap; }
    td { padding: 12px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; } tbody tr:last-child td { border-bottom: 0; } tbody tr:hover { background: var(--surface-2); }
    .act { width: 1%; text-align: right; } .nowrap { white-space: nowrap; } .empty { text-align: center; padding: 32px; } .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .who { display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; } .who:hover strong { color: var(--primary); }
    .av { width: 36px; height: 36px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 600; flex: none; }
    .role { font-weight: 500; } .custom { margin-left: 8px; font-size: 11px; padding: 1px 8px; border-radius: 99px; background: var(--primary-soft); color: var(--primary); }
    .badge { padding: 2px 10px; border-radius: 99px; font-size: 12px; } .Active { background: var(--green-soft); color: var(--green); } .Invited { background: var(--primary-soft); color: var(--primary); } .Suspended { background: var(--red-soft); color: var(--red); }
    .ib { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 6px; border: 0; background: none; color: var(--muted); text-decoration: none; font-size: 14px; } .ib:hover:not(:disabled) { background: var(--surface-2); color: var(--text); } .ib.del:hover:not(:disabled) { color: var(--red); } .ib:disabled { opacity: .3; cursor: not-allowed; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.del { background: var(--red); border-color: var(--red); color: #fff; }
    .overlay { position: fixed; inset: 0; background: rgb(0 0 0 / .55); display: grid; place-items: center; z-index: 50; padding: 16px; } .modal { width: 100%; max-width: 400px; padding: 24px; display: grid; gap: 12px; } .foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `,
})
export class Users {
  protected readonly svc = inject(UserService);
  protected readonly total = ALL_PERMS.length;
  protected readonly query = signal(''); protected readonly role = signal('');
  protected readonly deleting = signal<User | null>(null);
  protected readonly rows = computed(() => {
    const q = this.query().toLowerCase();
    return this.svc.users().filter(u => (!this.role() || u.role === this.role()) && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  });
  protected initials(u: User) { return u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(); }
  protected color(u: User) { return COLORS[u.id % COLORS.length]; }
  protected confirm() { const d = this.deleting(); if (d) this.svc.remove(d.id); this.deleting.set(null); }
}
