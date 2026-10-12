import { Injectable, computed, signal } from '@angular/core';

export type Category = 'Housing' | 'Food' | 'Transport' | 'Software' | 'Salary' | 'Utilities' | 'Leisure';
export interface Txn {
  id: number; date: string; name: string; category: Category;
  amount: number; // negative = expense
  status: 'Completed' | 'Pending';
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: '#1b84ff', Food: '#f59e0b', Transport: '#14b8a6', Software: '#7c5cfc',
  Salary: '#17a34a', Utilities: '#e5484d', Leisure: '#ec4899',
};

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  readonly income = [5200, 5200, 5900, 5200, 5200, 6100, 5200];
  readonly expenses = [3400, 3750, 3300, 4100, 3600, 3900, 3200];

  readonly transactions = signal<Txn[]>([
    { id: 1, date: '2026-10-11', name: 'Acme Corp Payroll', category: 'Salary', amount: 5200, status: 'Completed' },
    { id: 2, date: '2026-10-10', name: 'Riverside Apartments', category: 'Housing', amount: -1450, status: 'Completed' },
    { id: 3, date: '2026-10-09', name: 'Fresh Market', category: 'Food', amount: -86.4, status: 'Completed' },
    { id: 4, date: '2026-10-08', name: 'GitHub Copilot', category: 'Software', amount: -19, status: 'Completed' },
    { id: 5, date: '2026-10-07', name: 'City Transit Pass', category: 'Transport', amount: -64, status: 'Completed' },
    { id: 6, date: '2026-10-06', name: 'Power & Water', category: 'Utilities', amount: -132.75, status: 'Pending' },
    { id: 7, date: '2026-10-05', name: 'Cinema Night', category: 'Leisure', amount: -28, status: 'Completed' },
    { id: 8, date: '2026-10-04', name: 'Corner Bistro', category: 'Food', amount: -54.2, status: 'Completed' },
    { id: 9, date: '2026-10-03', name: 'Figma', category: 'Software', amount: -15, status: 'Completed' },
    { id: 10, date: '2026-10-02', name: 'Fuel Station', category: 'Transport', amount: -48.9, status: 'Pending' },
    { id: 11, date: '2026-10-01', name: 'Freelance Invoice #204', category: 'Salary', amount: 840, status: 'Completed' },
    { id: 12, date: '2026-09-29', name: 'Fresh Market', category: 'Food', amount: -102.1, status: 'Completed' },
  ]);

  readonly totalIncome = computed(() => this.sum(t => t.amount > 0));
  readonly totalExpenses = computed(() => -this.sum(t => t.amount < 0));
  readonly net = computed(() => this.totalIncome() - this.totalExpenses());
  readonly pending = computed(() => this.transactions().filter(t => t.status === 'Pending').length);

  readonly byCategory = computed(() => {
    const map = new Map<Category, number>();
    for (const t of this.transactions()) if (t.amount < 0) map.set(t.category, (map.get(t.category) ?? 0) - t.amount);
    return [...map].map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] })).sort((a, b) => b.value - a.value);
  });

  private sum(f: (t: Txn) => boolean) { return this.transactions().filter(f).reduce((s, t) => s + t.amount, 0); }
}
