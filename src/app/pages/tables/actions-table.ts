import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer, PLANS, STATUSES, makeCustomers } from './shared';

@Component({
  selector: 'app-actions-table',
  imports: [CurrencyPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'menu.set(null)', '(document:keydown.escape)': 'closeAll()' },
  template: `
    <div class="card">
      <header><div><h2>Row actions</h2><p class="muted">Use the ⋯ menu at the end of each row to edit or delete.</p></div></header>
      <div class="scroll">
        <table>
          <thead><tr><th>Customer</th><th class="hide-sm">Plan</th><th class="hide-sm">Status</th><th class="r">Balance</th><th class="act"><span class="sr">Actions</span></th></tr></thead>
          <tbody>
            @for (c of rows(); track c.id) {
              <tr>
                <td><strong>{{ c.name }}</strong><br><small class="muted">{{ c.email }}</small></td>
                <td class="hide-sm">{{ c.plan }}</td>
                <td class="hide-sm"><span class="badge" [class]="c.status">{{ c.status }}</span></td>
                <td class="r">{{ c.balance | currency:'USD':'symbol':'1.0-0' }}</td>
                <td class="act">
                  <div class="kebab" (click)="$event.stopPropagation()">
                    <button class="dots" (click)="menu.set(menu() === c.id ? null : c.id)" aria-haspopup="menu"
                      [attr.aria-expanded]="menu() === c.id" [attr.aria-label]="'Actions for ' + c.name">⋯</button>
                    @if (menu() === c.id) {
                      <div class="pop" role="menu">
                        <button role="menuitem" (click)="startEdit(c)">Edit</button>
                        <button role="menuitem" class="danger" (click)="deleting.set(c); menu.set(null)">Delete</button>
                      </div>
                    }
                  </div>
                </td>
              </tr>
            } @empty { <tr><td colspan="5" class="muted empty">No customers left.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>

    @if (editing(); as e) {
      <div class="overlay" (click)="editing.set(null)">
        <form class="modal card" role="dialog" aria-modal="true" aria-label="Edit customer" (click)="$event.stopPropagation()" (ngSubmit)="saveEdit()">
          <h2>Edit customer</h2>
          <label>Name<input name="name" [(ngModel)]="e.name" required /></label>
          <label>Email<input name="email" type="email" [(ngModel)]="e.email" required /></label>
          <div class="two">
            <label>Plan<select name="plan" [(ngModel)]="e.plan">@for (p of plans; track p) { <option>{{ p }}</option> }</select></label>
            <label>Status<select name="status" [(ngModel)]="e.status">@for (s of statuses; track s) { <option>{{ s }}</option> }</select></label>
          </div>
          <div class="foot"><button type="button" class="btn" (click)="editing.set(null)">Cancel</button><button class="btn primary">Save</button></div>
        </form>
      </div>
    }
    @if (deleting(); as d) {
      <div class="overlay" (click)="deleting.set(null)">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-label="Confirm delete" (click)="$event.stopPropagation()">
          <h2>Delete customer?</h2>
          <p class="muted">{{ d.name }} will be removed from this table.</p>
          <div class="foot"><button class="btn" (click)="deleting.set(null)">Cancel</button><button class="btn del" (click)="confirmDelete()">Delete</button></div>
        </div>
      </div>
    }
  `,
  styleUrl: './tables.scss',
})
export class ActionsTable {
  protected readonly plans = PLANS; protected readonly statuses = STATUSES;
  protected readonly rows = signal<Customer[]>(makeCustomers(6));
  protected readonly menu = signal<number | null>(null);
  protected readonly editing = signal<Customer | null>(null);
  protected readonly deleting = signal<Customer | null>(null);

  protected startEdit(c: Customer) { this.editing.set({ ...c }); this.menu.set(null); }
  protected saveEdit() { const e = this.editing(); if (e) this.rows.update(r => r.map(x => x.id === e.id ? e : x)); this.editing.set(null); }
  protected confirmDelete() { const d = this.deleting(); if (d) this.rows.update(r => r.filter(x => x.id !== d.id)); this.deleting.set(null); }
  protected closeAll() { this.menu.set(null); this.editing.set(null); this.deleting.set(null); }
}
