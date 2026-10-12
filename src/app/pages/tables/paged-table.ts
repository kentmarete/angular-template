import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Customer, makeCustomers } from './shared';

type Key = keyof Pick<Customer, 'name' | 'plan' | 'status' | 'balance'>;

@Component({
  selector: 'app-paged-table',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <header>
        <div><h2>Sorting &amp; pagination</h2><p class="muted">Click a column header to sort.</p></div>
        <input type="search" class="search" placeholder="Filter by name…" aria-label="Filter by name" (input)="setQuery($any($event.target).value)" />
      </header>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              @for (col of cols; track col.key) {
                <th [class.r]="col.key === 'balance'" [attr.aria-sort]="ariaSort(col.key)">
                  <button class="sort" (click)="sortBy(col.key)">{{ col.label }}
                    <span class="arrow" [class.on]="sortKey() === col.key">{{ sortKey() === col.key ? (asc() ? '▲' : '▼') : '↕' }}</span></button>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (c of page(); track c.id) {
              <tr>
                <td><strong>{{ c.name }}</strong></td><td>{{ c.plan }}</td>
                <td><span class="badge" [class]="c.status">{{ c.status }}</span></td>
                <td class="r">{{ c.balance | currency:'USD':'symbol':'1.0-0' }}</td>
              </tr>
            } @empty { <tr><td colspan="4" class="muted empty">No results.</td></tr> }
          </tbody>
        </table>
      </div>
      <footer>
        <span class="muted">{{ from() }}–{{ to() }} of {{ sorted().length }}</span>
        <label class="size muted">Rows
          <select aria-label="Rows per page" (change)="setSize($any($event.target).value)">
            @for (n of [5, 10, 20]; track n) { <option [value]="n" [selected]="n === size()">{{ n }}</option> }
          </select>
        </label>
        <nav class="pager" aria-label="Pagination">
          <button (click)="go(pageNo() - 1)" [disabled]="pageNo() === 1" aria-label="Previous page">‹</button>
          @for (p of pages(); track p) {
            <button [class.on]="p === pageNo()" [attr.aria-current]="p === pageNo() ? 'page' : null" (click)="go(p)">{{ p }}</button>
          }
          <button (click)="go(pageNo() + 1)" [disabled]="pageNo() === totalPages()" aria-label="Next page">›</button>
        </nav>
      </footer>
    </div>
  `,
  styleUrl: './tables.scss',
})
export class PagedTable {
  protected readonly cols: { key: Key; label: string }[] = [
    { key: 'name', label: 'Name' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }, { key: 'balance', label: 'Balance' },
  ];
  private readonly all = makeCustomers(47, 40);
  protected readonly query = signal('');
  protected readonly sortKey = signal<Key | null>(null);
  protected readonly asc = signal(true);
  protected readonly size = signal(5);
  protected readonly pageNo = signal(1);

  protected readonly sorted = computed(() => {
    const q = this.query().toLowerCase(); const k = this.sortKey(); const dir = this.asc() ? 1 : -1;
    const list = this.all.filter(c => c.name.toLowerCase().includes(q));
    return k ? [...list].sort((a, b) => (typeof a[k] === 'number' ? (a[k] as number) - (b[k] as number) : String(a[k]).localeCompare(String(b[k]))) * dir) : list;
  });
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.size())));
  protected readonly page = computed(() => this.sorted().slice((this.pageNo() - 1) * this.size(), this.pageNo() * this.size()));
  protected readonly from = computed(() => (this.sorted().length ? (this.pageNo() - 1) * this.size() + 1 : 0));
  protected readonly to = computed(() => Math.min(this.pageNo() * this.size(), this.sorted().length));
  /** Up to 5 page buttons centred on the current page. */
  protected readonly pages = computed(() => {
    const t = this.totalPages(); const start = Math.max(1, Math.min(this.pageNo() - 2, t - 4));
    return Array.from({ length: Math.min(5, t) }, (_, i) => start + i);
  });

  protected sortBy(k: Key) {
    if (this.sortKey() === k) this.asc.update(a => !a); else { this.sortKey.set(k); this.asc.set(true); }
    this.pageNo.set(1);
  }
  protected ariaSort(k: Key) { return this.sortKey() === k ? (this.asc() ? 'ascending' : 'descending') : 'none'; }
  protected setQuery(v: string) { this.query.set(v); this.pageNo.set(1); }
  protected setSize(v: string) { this.size.set(Number(v)); this.pageNo.set(1); }
  protected go(n: number) { this.pageNo.set(Math.min(Math.max(1, n), this.totalPages())); }
}
