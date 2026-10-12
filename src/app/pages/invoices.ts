import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Invoice, InvoiceService, STATUSES, totalOf } from '../core/invoices';

@Component({
  selector: 'app-invoices',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'deleting.set(null)' },
  template: `
    <section class="kpis">
      @for (k of kpis(); track k.label) {
        <article class="card kpi"><span class="muted">{{ k.label }}</span><strong>{{ k.value | currency:'USD':'symbol':'1.0-0' }}</strong><small class="muted">{{ k.count }} invoices</small></article>
      }
    </section>

    <div class="card">
      <header>
        <h2>Invoices</h2>
        <div class="tools">
          <div class="chips" role="group" aria-label="Filter by status">
            <button [class.on]="!status()" (click)="status.set('')">All</button>
            @for (s of statuses; track s) { <button [class.on]="status() === s" (click)="status.set(s)">{{ s }}</button> }
          </div>
          <a class="btn primary" routerLink="/invoices/new/edit">＋ New invoice</a>
        </div>
      </header>
      <div class="scroll">
        <table>
          <thead><tr><th>Invoice</th><th class="hide-sm">Client</th><th class="hide-sm">Issued</th><th class="hide-sm">Due</th><th class="r">Amount</th><th>Status</th><th class="act"><span class="sr">Actions</span></th></tr></thead>
          <tbody>
            @for (i of rows(); track i.id) {
              <tr>
                <td><a class="num" [routerLink]="['/invoices', i.id]">{{ i.number }}</a><small class="muted show-sm">{{ i.client }}</small></td>
                <td class="hide-sm">{{ i.client }}</td>
                <td class="muted hide-sm">{{ i.issueDate | date:'MMM d, y' }}</td>
                <td class="muted hide-sm">{{ i.dueDate | date:'MMM d, y' }}</td>
                <td class="r">{{ total(i) | currency }}</td>
                <td><span class="badge {{ i.status }}">{{ i.status }}</span></td>
                <td class="act nowrap">
                  <a class="ib" [routerLink]="['/invoices', i.id]" [attr.aria-label]="'Preview ' + i.number" title="Preview">👁</a>
                  <a class="ib" [routerLink]="['/invoices', i.id, 'edit']" [attr.aria-label]="'Edit ' + i.number" title="Edit">✎</a>
                  <button class="ib del" (click)="deleting.set(i)" [attr.aria-label]="'Delete ' + i.number" title="Delete">🗑</button>
                </td>
              </tr>
            } @empty { <tr><td colspan="7" class="muted empty">No invoices found.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>

    @if (deleting(); as d) {
      <div class="overlay" (click)="deleting.set(null)">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-label="Confirm delete" (click)="$event.stopPropagation()">
          <h3>Delete {{ d.number }}?</h3><p class="muted">This invoice for {{ d.client }} will be permanently removed.</p>
          <div class="foot"><button class="btn" (click)="deleting.set(null)">Cancel</button><button class="btn del" (click)="confirm()">Delete</button></div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; } .kpi { padding: 18px 20px; display: grid; gap: 2px; } .kpi strong { font-size: 24px; letter-spacing: -.02em; }
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; flex-wrap: wrap; } h2 { font-size: 16px; font-weight: 600; } h3 { font-size: 16px; }
    .tools { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; min-width: 0; max-width: 100%; }
    .chips { min-width: 0; display: flex; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; } .chips button { border: 0; background: none; padding: 5px 12px; border-radius: 7px; color: var(--muted); font-size: 13px; } .chips button.on { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgb(0 0 0 / .2); }
    .scroll { overflow-x: auto; position: relative; } table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 10px 20px; border-block: 1px solid var(--border); background: var(--surface-2); white-space: nowrap; }
    td { padding: 12px 20px; border-bottom: 1px solid var(--border); } tbody tr:last-child td { border-bottom: 0; } tbody tr:hover { background: var(--surface-2); }
    .r { text-align: right; font-variant-numeric: tabular-nums; } .act { width: 1%; text-align: right; } .nowrap { white-space: nowrap; } .empty { text-align: center; padding: 32px; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .num { color: var(--primary); font-weight: 600; text-decoration: none; } .num:hover { text-decoration: underline; }
    .badge { padding: 2px 10px; border-radius: 99px; font-size: 12px; } .Paid { background: var(--green-soft); color: var(--green); } .Pending { background: var(--primary-soft); color: var(--primary); } .Overdue { background: var(--red-soft); color: var(--red); } .Draft { background: var(--surface-2); color: var(--muted); }
    .ib { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 6px; border: 0; background: none; color: var(--muted); text-decoration: none; font-size: 14px; } .ib:hover { background: var(--surface-2); color: var(--text); } .ib.del:hover { color: var(--red); }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); text-decoration: none; color: var(--text); } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.del { background: var(--red); border-color: var(--red); color: #fff; }
    .overlay { position: fixed; inset: 0; background: rgb(0 0 0 / .55); display: grid; place-items: center; z-index: 50; padding: 16px; } .modal { width: 100%; max-width: 400px; padding: 24px; display: grid; gap: 12px; } .foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `,
})
export class Invoices {
  private readonly svc = inject(InvoiceService);
  protected readonly statuses = STATUSES;
  protected readonly status = signal('');
  protected readonly deleting = signal<Invoice | null>(null);
  protected readonly total = totalOf;
  protected readonly rows = computed(() => this.svc.invoices().filter(i => !this.status() || i.status === this.status()));
  protected readonly kpis = computed(() => {
    const sum = (s: string) => { const l = this.svc.invoices().filter(i => i.status === s); return { value: l.reduce((a, i) => a + totalOf(i), 0), count: l.length }; };
    return [{ label: 'Paid', ...sum('Paid') }, { label: 'Pending', ...sum('Pending') }, { label: 'Overdue', ...sum('Overdue') }, { label: 'Drafts', ...sum('Draft') }];
  });
  protected confirm() { const d = this.deleting(); if (d) this.svc.remove(d.id); this.deleting.set(null); }
}
