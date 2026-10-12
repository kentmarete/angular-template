import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer, PLANS, STATUSES, makeCustomers } from './shared';

@Component({
  selector: 'app-inline-table',
  imports: [CurrencyPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <header><div><h2>Inline editing</h2><p class="muted">Press the pencil to edit a row in place. Enter saves, Esc cancels.</p></div></header>
      <div class="scroll">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th class="r">Balance</th><th class="act"><span class="sr">Actions</span></th></tr></thead>
          <tbody>
            @for (c of rows(); track c.id) {
              @if (draft()?.id === c.id) {
                <tr class="editing" (keydown.enter)="save()" (keydown.escape)="cancel()">
                  <td><input aria-label="Name" [(ngModel)]="draft()!.name" /></td>
                  <td><input aria-label="Email" type="email" [(ngModel)]="draft()!.email" /></td>
                  <td><select aria-label="Plan" [(ngModel)]="draft()!.plan">@for (p of plans; track p) { <option>{{ p }}</option> }</select></td>
                  <td><select aria-label="Status" [(ngModel)]="draft()!.status">@for (s of statuses; track s) { <option>{{ s }}</option> }</select></td>
                  <td class="r"><input aria-label="Balance" type="number" class="num" [(ngModel)]="draft()!.balance" /></td>
                  <td class="act nowrap">
                    <button class="btn sm primary" (click)="save()">Save</button>
                    <button class="btn sm" (click)="cancel()">Cancel</button>
                  </td>
                </tr>
              } @else {
                <tr>
                  <td><strong>{{ c.name }}</strong></td><td class="muted">{{ c.email }}</td><td>{{ c.plan }}</td>
                  <td><span class="badge" [class]="c.status">{{ c.status }}</span></td>
                  <td class="r">{{ c.balance | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td class="act"><button class="dots" (click)="edit(c)" [attr.aria-label]="'Edit ' + c.name">✎</button></td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrl: './tables.scss',
})
export class InlineTable {
  protected readonly plans = PLANS; protected readonly statuses = STATUSES;
  protected readonly rows = signal<Customer[]>(makeCustomers(5, 20));
  protected readonly draft = signal<Customer | null>(null);

  protected edit(c: Customer) { this.draft.set({ ...c }); }
  protected cancel() { this.draft.set(null); }
  protected save() {
    const d = this.draft(); if (!d?.name.trim()) return;
    this.rows.update(r => r.map(x => x.id === d.id ? { ...d, balance: Number(d.balance) || 0 } : x));
    this.draft.set(null);
  }
}
