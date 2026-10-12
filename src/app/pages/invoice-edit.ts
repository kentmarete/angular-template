import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Invoice, InvoiceService, STATUSES, subtotal, taxOf, totalOf } from '../core/invoices';

@Component({
  selector: 'app-invoice-edit',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (form(); as f) {
      <form [formGroup]="f" (ngSubmit)="save()" novalidate>
        <div class="bar">
          <div><h2>{{ isNew() ? 'New invoice' : 'Edit invoice' }}</h2><p class="muted">{{ f.controls['number'].value }}</p></div>
          <span class="sp"></span>
          <a class="btn" [routerLink]="isNew() ? '/invoices' : ['/invoices', invoiceId()]">Cancel</a>
          <button class="btn primary" type="submit">Save invoice</button>
        </div>

        <section class="card pad">
          <h3>Client</h3>
          <div class="row2">
            <label>Client name<input formControlName="client" [class.invalid]="bad('client')" />@if (bad('client')) { <small class="err">Client name is required.</small> }</label>
            <label>Client email<input type="email" formControlName="email" [class.invalid]="bad('email')" />@if (bad('email')) { <small class="err">Enter a valid email.</small> }</label>
          </div>
          <label>Billing address<textarea rows="2" formControlName="address"></textarea></label>
        </section>

        <section class="card pad">
          <h3>Details</h3>
          <div class="row3">
            <label>Issue date<input type="date" formControlName="issueDate" /></label>
            <label>Due date<input type="date" formControlName="dueDate" /></label>
            <label>Status<select formControlName="status">@for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }</select></label>
          </div>
        </section>

        <section class="card pad">
          <h3>Line items</h3>
          <div class="items" formArrayName="items">
            <div class="ih"><span>Description</span><span>Qty</span><span>Unit price</span><span class="r">Amount</span><span></span></div>
            @for (g of items.controls; track g; let n = $index) {
              <div class="ir" [formGroupName]="n">
                <input formControlName="desc" placeholder="Item description" [attr.aria-label]="'Description ' + (n + 1)" />
                <input type="number" min="0" formControlName="qty" [attr.aria-label]="'Quantity ' + (n + 1)" />
                <input type="number" min="0" step="0.01" formControlName="price" [attr.aria-label]="'Unit price ' + (n + 1)" />
                <span class="r amt">{{ (g.value.qty || 0) * (g.value.price || 0) | currency }}</span>
                <button type="button" class="x" (click)="removeItem(n)" [disabled]="items.length === 1" [attr.aria-label]="'Remove item ' + (n + 1)">✕</button>
              </div>
            }
          </div>
          <button type="button" class="btn sm" (click)="addItem()">＋ Add item</button>
        </section>

        <div class="split">
          <section class="card pad">
            <h3>Notes</h3><textarea rows="4" formControlName="notes" placeholder="Payment terms, thank-you message…"></textarea>
          </section>
          <section class="card pad">
            <h3>Summary</h3>
            <label class="tax">Tax rate (%)<input type="number" min="0" max="100" formControlName="taxRate" /></label>
            <dl class="sum"><dt>Subtotal</dt><dd>{{ sub() | currency }}</dd><dt>Tax</dt><dd>{{ tax() | currency }}</dd><dt class="g">Total</dt><dd class="g">{{ tot() | currency }}</dd></dl>
          </section>
        </div>
      </form>
    } @else {
      <section class="card empty"><h2>Invoice not found</h2><a class="btn primary" routerLink="/invoices">Back to invoices</a></section>
    }
  `,
  styles: `
    :host { display: block; max-width: 900px; } form { display: grid; gap: 20px; }
    .bar { display: flex; align-items: center; gap: 10px; } .sp { flex: 1; } h2 { font-size: 18px; font-weight: 600; } h3 { font-size: 14px; font-weight: 600; }
    .pad { padding: 20px; display: grid; gap: 14px; } .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; } .row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; }
    input, select, textarea { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; font-weight: 400; outline: none; } input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .invalid { border-color: var(--red) !important; } .err { color: var(--red); font-weight: 400; } textarea { resize: vertical; }
    .items { display: grid; gap: 8px; } .ih, .ir { display: grid; grid-template-columns: 1fr 80px 120px 110px 32px; gap: 10px; align-items: center; } .ih { font-size: 12px; color: var(--muted); } .r { text-align: right; } .amt { font-variant-numeric: tabular-nums; font-weight: 500; }
    .x { width: 30px; height: 30px; border-radius: 6px; border: 0; background: none; color: var(--muted); } .x:hover:not(:disabled) { background: var(--red-soft); color: var(--red); } .x:disabled { opacity: .3; cursor: not-allowed; }
    .split { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start; } .tax { max-width: 140px; }
    .sum { display: grid; grid-template-columns: 1fr auto; gap: 6px 20px; margin: 0; } .sum dt { color: var(--muted); } .sum dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; } .g { font-size: 18px; font-weight: 700; color: var(--text) !important; padding-top: 8px; border-top: 1px solid var(--border); }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; justify-self: start; } .btn.sm { padding: 6px 12px; font-size: 13px; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .empty { padding: 48px; text-align: center; display: grid; gap: 12px; justify-items: center; }
    @media (max-width: 760px) { .row2, .row3, .split { grid-template-columns: 1fr; } .ih { display: none; } .ir { grid-template-columns: 1fr 70px 100px 32px; } .ir .amt { display: none; } }
  `,
})
export class InvoiceEdit {
  /** Route param: an invoice id, or "new". */
  readonly id = input<string>();
  private readonly svc = inject(InvoiceService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly statuses = STATUSES;
  protected readonly form = signal<FormGroup | null>(null);
  protected readonly isNew = signal(false);
  private base: Invoice | null = null;

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.isNew.set(id === 'new');
        this.base = id === 'new' ? this.svc.blank() : (this.svc.get(Number(id)) ?? null);
        this.form.set(this.base ? this.build(this.base) : null);
      });
    });
  }

  protected invoiceId() { return this.base?.id; }
  protected get items() { return this.form()!.controls['items'] as FormArray<FormGroup>; }
  protected bad(k: string) { const c = this.form()!.controls[k]; return c.invalid && (c.touched || c.dirty); }
  protected current() { return this.form()!.getRawValue() as Pick<Invoice, 'items' | 'taxRate'>; }
  protected sub() { return subtotal(this.current()); } protected tax() { return taxOf(this.current()); } protected tot() { return totalOf(this.current()); }

  protected addItem() { this.items.push(this.itemGroup({ desc: '', qty: 1, price: 0 })); }
  protected removeItem(n: number) { if (this.items.length > 1) this.items.removeAt(n); }

  protected save() {
    const f = this.form()!; f.markAllAsTouched();
    if (f.invalid || !this.base) return;
    const v = f.getRawValue();
    const saved: Invoice = { ...this.base, ...v, items: v.items.map((l: Invoice['items'][number]) => ({ desc: l.desc, qty: Number(l.qty) || 0, price: Number(l.price) || 0 })), taxRate: Number(v.taxRate) || 0 };
    this.svc.save(saved);
    this.router.navigate(['/invoices', saved.id]);
  }

  private itemGroup(l: Invoice['items'][number]) { return this.fb.group({ desc: [l.desc, Validators.required], qty: l.qty, price: l.price }); }
  private build(i: Invoice) {
    return this.fb.group({
      number: i.number, client: [i.client, Validators.required], email: [i.email, [Validators.required, Validators.email]], address: i.address,
      issueDate: i.issueDate, dueDate: i.dueDate, status: i.status, taxRate: i.taxRate, notes: i.notes,
      items: this.fb.array(i.items.map(l => this.itemGroup(l))),
    });
  }
}
