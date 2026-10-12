import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CATEGORY_COLORS, Category, DataService } from '../core/data';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="bar">
        <input type="search" placeholder="Search transactions…" aria-label="Search" (input)="query.set($any($event.target).value)" />
        <select aria-label="Category" (change)="cat.set($any($event.target).value)">
          <option value="">All categories</option>
          @for (c of cats; track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <button (click)="sortAsc.set(!sortAsc())">Date {{ sortAsc() ? '↑' : '↓' }}</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Date</th><th>Status</th><th class="r">Amount</th></tr></thead>
        <tbody>
          @for (t of rows(); track t.id) {
            <tr>
              <td><strong>{{ t.name }}</strong></td>
              <td><i class="dot" [style.background]="colors[t.category]"></i>{{ t.category }}</td>
              <td class="muted">{{ t.date | date:'mediumDate' }}</td>
              <td><span class="badge" [class.pending]="t.status === 'Pending'">{{ t.status }}</span></td>
              <td class="r" [class.up]="t.amount > 0">{{ t.amount | currency }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="muted empty">No transactions match your filters.</td></tr>
          }
        </tbody>
      </table>
      <footer class="muted">{{ rows().length }} of {{ data.transactions().length }} transactions</footer>
    </div>
  `,
  styles: `
    .card { overflow-x: auto; } table { min-width: 560px; }
    .bar { display: flex; gap: 10px; padding: 16px; flex-wrap: wrap; }
    input, select, button { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 8px 12px; font: inherit; }
    input { flex: 1; min-width: 200px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 10px 16px; border-block: 1px solid var(--border); background: var(--surface-2); }
    td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .r { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
    .badge { background: var(--green-soft); color: var(--green); padding: 2px 10px; border-radius: 99px; font-size: 12px; }
    .badge.pending { background: var(--primary-soft); color: var(--primary); }
    .empty { text-align: center; padding: 32px; } footer { padding: 12px 16px; font-size: 12px; }
  `,
})
export class Transactions {
  protected readonly data = inject(DataService);
  protected readonly colors = CATEGORY_COLORS;
  protected readonly cats = Object.keys(CATEGORY_COLORS) as Category[];
  protected readonly query = signal('');
  protected readonly cat = signal('');
  protected readonly sortAsc = signal(false);
  protected readonly rows = computed(() => {
    const q = this.query().toLowerCase();
    const list = this.data.transactions().filter(t => (!this.cat() || t.category === this.cat()) && t.name.toLowerCase().includes(q));
    return list.sort((a, b) => (this.sortAsc() ? 1 : -1) * a.date.localeCompare(b.date));
  });
}
