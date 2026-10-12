import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoiceService, subtotal, taxOf, totalOf } from '../core/invoices';

@Component({
  selector: 'app-invoice-preview',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (inv(); as i) {
      <div class="bar">
        <a routerLink="/invoices" class="back">← All invoices</a>
        <span class="sp"></span>
        <a class="btn" [routerLink]="['/invoices', i.id, 'edit']">Edit</a>
        <button class="btn primary" (click)="print()">Print / Save PDF</button>
      </div>

      <article class="paper" aria-label="Invoice {{ i.number }}">
        <header>
          <div class="brand"><span class="logo">F</span><div><strong>Fin Ltd</strong><br><small>12 Riverside Drive, Nairobi<br>billing&#64;fin.example.com</small></div></div>
          <div class="meta"><h1>INVOICE</h1><p>{{ i.number }}</p><span class="badge {{ i.status }}">{{ i.status }}</span></div>
        </header>

        <section class="parties">
          <div><h3>Bill to</h3><strong>{{ i.client || '—' }}</strong><p class="pre">{{ i.address }}</p><p>{{ i.email }}</p></div>
          <dl><dt>Issue date</dt><dd>{{ i.issueDate | date:'longDate' }}</dd><dt>Due date</dt><dd>{{ i.dueDate | date:'longDate' }}</dd></dl>
        </section>

        <table>
          <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
          <tbody>@for (l of i.items; track $index) { <tr><td>{{ l.desc }}</td><td class="r">{{ l.qty }}</td><td class="r">{{ l.price | currency }}</td><td class="r">{{ l.qty * l.price | currency }}</td></tr> }</tbody>
        </table>

        <dl class="totals">
          <dt>Subtotal</dt><dd>{{ sub(i) | currency }}</dd>
          <dt>Tax ({{ i.taxRate }}%)</dt><dd>{{ tax(i) | currency }}</dd>
          <dt class="grand">Total due</dt><dd class="grand">{{ total(i) | currency }}</dd>
        </dl>

        @if (i.notes) { <footer><h3>Notes</h3><p>{{ i.notes }}</p></footer> }
      </article>
    } @else {
      <section class="card empty"><h2>Invoice not found</h2><a class="btn primary" routerLink="/invoices">Back to invoices</a></section>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; max-width: 820px; }
    .bar { display: flex; gap: 10px; align-items: center; } .sp { flex: 1; } .back { color: var(--primary); text-decoration: none; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    /* the invoice is always "paper": light surface, dark text, in both themes */
    .paper { background: #fff; color: #17191f; border-radius: 12px; padding: 44px; display: grid; gap: 28px; box-shadow: 0 8px 30px rgb(0 0 0 / .25); }
    header { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .brand { display: flex; gap: 12px; align-items: flex-start; line-height: 1.5; } .logo { width: 40px; height: 40px; border-radius: 10px; background: #1b84ff; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 20px; flex: none; }
    .meta { text-align: right; } h1 { margin: 0; font-size: 28px; letter-spacing: .08em; color: #1b84ff; } .meta p { margin: 2px 0 8px; color: #6b7280; }
    .badge { padding: 2px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; } .Paid { background: #e3f6ea; color: #17803b; } .Pending { background: #e8f2ff; color: #1b6fd8; } .Overdue { background: #fdeaeb; color: #c0353a; } .Draft { background: #eef0f3; color: #6b7280; }
    .parties { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; } h3 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; } .parties p { margin: 2px 0; color: #4b5563; } .pre { white-space: pre-line; }
    dl { margin: 0; } .parties dl { display: grid; grid-template-columns: auto auto; gap: 4px 20px; } dt { color: #6b7280; } dd { margin: 0; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; } th { text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; padding: 10px 0; border-bottom: 2px solid #17191f; } td { padding: 12px 0; border-bottom: 1px solid #e4e7ec; } .r { text-align: right; font-variant-numeric: tabular-nums; }
    .totals { display: grid; grid-template-columns: 1fr auto; gap: 8px 40px; justify-self: end; min-width: 260px; } .totals dd { text-align: right; font-variant-numeric: tabular-nums; } .grand { font-size: 18px; font-weight: 700; color: #17191f; padding-top: 10px; border-top: 2px solid #17191f; }
    footer p { margin: 0; color: #4b5563; } .empty { padding: 48px; text-align: center; display: grid; gap: 12px; justify-items: center; }
    @media (max-width: 640px) { .paper { padding: 20px; gap: 22px; } .meta { text-align: left; } h1 { font-size: 22px; } .parties dl { grid-template-columns: 1fr; gap: 0 20px; } .parties dd { margin-bottom: 6px; } }
    @media (max-width: 480px) { .paper { padding: 16px; } table { display: block; overflow-x: auto; } .totals { min-width: 0; width: 100%; } }
  `,
})
export class InvoicePreview {
  readonly id = input<string>();
  private readonly svc = inject(InvoiceService);
  protected readonly inv = computed(() => this.svc.invoices().find(i => i.id === Number(this.id())));
  protected readonly sub = subtotal; protected readonly tax = taxOf; protected readonly total = totalOf;
  protected print() { window.print(); }
}
