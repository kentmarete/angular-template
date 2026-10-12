import { Injectable, signal } from '@angular/core';

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';
export interface LineItem { desc: string; qty: number; price: number; }
export interface Invoice {
  id: number; number: string; client: string; email: string; address: string;
  issueDate: string; dueDate: string; status: InvoiceStatus; items: LineItem[]; taxRate: number; notes: string;
}
export const STATUSES: InvoiceStatus[] = ['Draft', 'Pending', 'Paid', 'Overdue'];

export const subtotal = (i: Pick<Invoice, 'items'>) => i.items.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
export const taxOf = (i: Pick<Invoice, 'items' | 'taxRate'>) => subtotal(i) * ((Number(i.taxRate) || 0) / 100);
export const totalOf = (i: Pick<Invoice, 'items' | 'taxRate'>) => subtotal(i) + taxOf(i);

const inv = (id: number, client: string, issue: string, due: string, status: InvoiceStatus, items: LineItem[], taxRate = 16): Invoice => ({
  id, number: `INV-${String(1000 + id)}`, client, email: `billing@${client.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
  address: '12 Riverside Drive\nNairobi, Kenya', issueDate: issue, dueDate: due, status, items, taxRate,
  notes: 'Payment is due within 30 days. Thank you for your business!',
});

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  readonly invoices = signal<Invoice[]>([
    inv(1, 'Acme Corp', '2026-10-05', '2026-11-04', 'Pending', [{ desc: 'Website redesign', qty: 1, price: 4200 }, { desc: 'Hosting (annual)', qty: 1, price: 480 }]),
    inv(2, 'Globex Ltd', '2026-09-28', '2026-10-28', 'Paid', [{ desc: 'Consulting', qty: 24, price: 95 }]),
    inv(3, 'Initech', '2026-09-10', '2026-10-10', 'Overdue', [{ desc: 'Support retainer', qty: 3, price: 650 }, { desc: 'Onboarding', qty: 1, price: 300 }]),
    inv(4, 'Umbrella Co', '2026-10-08', '2026-11-07', 'Draft', [{ desc: 'Brand workshop', qty: 2, price: 1200 }]),
    inv(5, 'Stark Industries', '2026-08-30', '2026-09-29', 'Paid', [{ desc: 'Prototype build', qty: 1, price: 8800 }, { desc: 'Testing', qty: 12, price: 80 }]),
    inv(6, 'Wayne Enterprises', '2026-09-02', '2026-10-02', 'Overdue', [{ desc: 'Security audit', qty: 1, price: 5400 }]),
    inv(7, 'Hooli', '2026-10-01', '2026-10-31', 'Pending', [{ desc: 'API integration', qty: 40, price: 110 }]),
    inv(8, 'Pied Piper', '2026-09-18', '2026-10-18', 'Paid', [{ desc: 'Data migration', qty: 1, price: 2750 }]),
  ]);

  get(id: number) { return this.invoices().find(i => i.id === id); }
  blank(): Invoice {
    const next = Math.max(0, ...this.invoices().map(i => i.id)) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    return { id: next, number: `INV-${1000 + next}`, client: '', email: '', address: '', issueDate: today, dueDate: due, status: 'Draft', items: [{ desc: '', qty: 1, price: 0 }], taxRate: 16, notes: '' };
  }
  save(i: Invoice) {
    this.invoices.update(l => (l.some(x => x.id === i.id) ? l.map(x => (x.id === i.id ? i : x)) : [i, ...l]));
  }
  remove(id: number) { this.invoices.update(l => l.filter(i => i.id !== id)); }
}
