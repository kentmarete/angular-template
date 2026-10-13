import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Invoice, InvoiceService, subtotal, taxOf, totalOf } from '../core/invoices';

interface Payment { date: string; method: string; amount: number; }
const addDays = (d: string, n: number) => new Date(new Date(d).getTime() + n * 864e5).toISOString().slice(0, 10);

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
        @if (balance() > 0) { <button class="btn" type="button" (click)="record(i)">Record payment</button> }
        <button class="btn primary" (click)="print()">Print / Save PDF</button>
      </div>

      <div class="cols">

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

      <aside class="side" aria-label="Invoice details">
        <section class="card">
          <h2>Summary</h2>
          <dl class="kv">
            <dt>Status</dt><dd><span class="chip {{ i.status }}">{{ i.status }}</span></dd>
            <dt>Due</dt><dd>{{ i.dueDate | date:'mediumDate' }}</dd>
            <dt>Amount</dt><dd>{{ total(i) | currency }}</dd>
            <dt>Balance due</dt><dd [class.owed]="balance() > 0">{{ balance() | currency }}</dd>
          </dl>
        </section>

        <section class="card">
          <h2>Payment history</h2>
          @if (payments().length) {
            <ol class="pay">
              @for (p of payments(); track $index) {
                <li><span class="n">{{ $index + 1 }}</span><div><strong>Payment</strong><small class="muted">{{ p.date | date:'mediumDate' }} · {{ p.method }}</small></div><strong>{{ p.amount | currency }}</strong></li>
              }
            </ol>
          } @else { <p class="muted small">No payments recorded yet.</p> }
        </section>

        <section class="card">
          <h2>Related</h2>
          <a class="rel" routerLink="/transactions"><strong>{{ i.client }}</strong><small class="muted">{{ i.email }}</small></a>
          <a class="rel" routerLink="/tickets/4210"><strong>Support ticket #4210</strong><small class="muted">Open conversation</small></a>
        </section>

        <section class="card">
          <h2>Activity</h2>
          <ol class="feed">
            @for (a of activity(); track $index) { <li><span class="dot"></span><div>{{ a.text }}<small class="muted">{{ a.date | date:'mediumDate' }}</small></div></li> }
          </ol>
        </section>
      </aside>
      </div>
    } @else {
      <section class="card empty"><h2>Invoice not found</h2><a class="btn primary" routerLink="/invoices">Back to invoices</a></section>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; max-width: 1160px; }
    .cols { display: grid; grid-template-columns: minmax(0, 820px) minmax(260px, 1fr); gap: 20px; align-items: start; }
    .side { display: grid; gap: 16px; } .side .card { padding: 16px; } .side h2 { font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); } .small { font-size: 13px; margin: 0; }
    .kv { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; font-size: 14px; } .kv dt { color: var(--muted); } .kv dd { text-align: right; font-weight: 500; } .owed { color: var(--red); }
    .chip { padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; } .chip.Paid { background: var(--green-soft); color: var(--green); } .chip.Pending { background: var(--primary-soft); color: var(--primary); } .chip.Overdue { background: var(--red-soft); color: var(--red); } .chip.Draft { background: var(--surface-2); color: var(--muted); }
    .pay, .feed { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; } .pay li { display: grid; grid-template-columns: 24px 1fr auto; gap: 10px; align-items: center; font-size: 14px; } .pay div { display: grid; gap: 2px; } .pay small, .feed small { font-size: 12px; }
    .n { width: 22px; height: 22px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; font-size: 11px; font-weight: 600; }
    .rel { display: grid; gap: 2px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; color: var(--text); text-decoration: none; font-size: 14px; margin-top: 8px; } .rel:first-of-type { margin-top: 0; } .rel:hover { border-color: var(--primary); }
    .feed li { display: grid; grid-template-columns: 10px 1fr; gap: 10px; font-size: 14px; } .feed div { display: grid; gap: 2px; } .feed .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 6px; }
    @media (max-width: 1100px) { .cols { grid-template-columns: minmax(0, 1fr); } }
    @media print { .side, .bar { display: none; } }
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
  private readonly recorded = signal<Record<number, Payment[]>>({});
  protected readonly payments = computed<Payment[]>(() => {
    const i = this.inv(); if (!i) return [];
    return this.recorded()[i.id] ?? (i.status === 'Paid' ? [{ date: addDays(i.issueDate, 3), method: 'Visa ending in 4821', amount: totalOf(i) }] : []);
  });
  protected readonly balance = computed(() => {
    const i = this.inv(); if (!i) return 0;
    return Math.max(0, totalOf(i) - this.payments().reduce((a, p) => a + p.amount, 0));
  });
  protected readonly activity = computed(() => {
    const i = this.inv(); if (!i) return [];
    const rows = [{ date: i.issueDate, text: `Invoice ${i.number} issued` }];
    if (i.status !== 'Draft') rows.push({ date: i.issueDate, text: `Invoice sent to ${i.email}` });
    this.payments().forEach(p => rows.push({ date: p.date, text: `Payment received $${p.amount.toFixed(2)} on ${p.method}` }));
    if (i.status === 'Overdue') rows.push({ date: i.dueDate, text: 'Invoice became overdue' });
    return rows.reverse();
  });
  protected record(i: Invoice) {
    const amount = this.balance(); if (amount <= 0) return;
    const date = new Date().toISOString().slice(0, 10);
    this.recorded.update(r => ({ ...r, [i.id]: [...this.payments(), { date, method: 'Bank transfer', amount }] }));
    this.svc.save({ ...i, status: 'Paid' });
  }
  protected print() { window.print(); }
}
