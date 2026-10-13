import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../core/data';

@Component({
  selector: 'app-overview',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="kpis">
      @for (k of kpis(); track k.label) {
        <article class="card kpi">
          <span class="muted">{{ k.label }}</span>
          <strong>{{ k.value }}</strong>
          <small [class]="k.up ? 'up' : 'down'">{{ k.up ? '▲' : '▼' }} {{ k.delta }}% <span class="muted">vs last month</span></small>
        </article>
      }
    </section>

    <section class="grid">
      <article class="card pad">
        <header><h2>Cash flow</h2>
          <div class="legend"><span><i class="dot" style="background:var(--primary)"></i>Income</span><span><i class="dot" style="background:var(--amber)"></i>Expenses</span></div>
        </header>
        <svg viewBox="0 0 560 240" role="img" aria-label="Income and expenses by month">
          @for (g of grid; track g) {
            <line x1="40" x2="550" [attr.y1]="y(g)" [attr.y2]="y(g)" stroke="var(--border)" />
            <text x="34" [attr.y]="y(g) + 4" text-anchor="end" class="axis">{{ g / 1000 }}k</text>
          }
          @for (m of data.months; track m; let i = $index) {
            <rect [attr.x]="x(i) - 17" [attr.y]="y(data.income[i])" width="15" [attr.height]="200 - y(data.income[i])" rx="4" fill="var(--primary)">
              <title>{{ m }} income {{ data.income[i] | currency:'USD':'symbol':'1.0-0' }}</title></rect>
            <rect [attr.x]="x(i) + 2" [attr.y]="y(data.expenses[i])" width="15" [attr.height]="200 - y(data.expenses[i])" rx="4" fill="var(--amber)">
              <title>{{ m }} expenses {{ data.expenses[i] | currency:'USD':'symbol':'1.0-0' }}</title></rect>
            <text [attr.x]="x(i)" y="222" text-anchor="middle" class="axis">{{ m }}</text>
          }
        </svg>
      </article>

      <article class="card pad">
        <header><h2>Spending by category</h2></header>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label="Spending by category">
            <circle cx="60" cy="60" r="44" fill="none" stroke="var(--surface-2)" stroke-width="16" />
            @for (s of slices(); track s.name) {
              <circle cx="60" cy="60" r="44" fill="none" [attr.stroke]="s.color" stroke-width="16"
                [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset" transform="rotate(-90 60 60)" />
            }
            <text x="60" y="58" text-anchor="middle" class="axis">Spent</text>
            <text x="60" y="73" text-anchor="middle" style="font-weight:600;font-size:12px;fill:var(--text)">{{ data.totalExpenses() | currency:'USD':'symbol':'1.0-0' }}</text>
          </svg>
          <ul>
            @for (s of slices(); track s.name) {
              <li><i class="dot" [style.background]="s.color"></i>{{ s.name }}<span class="muted">{{ s.pct | number:'1.0-0' }}%</span></li>
            }
          </ul>
        </div>
      </article>
    </section>

    <article class="card pad">
      <header><h2>Recent transactions</h2><a routerLink="/transactions">View all →</a></header>
      <table>
        <tbody>
          @for (t of recent(); track t.id) {
            <tr>
              <td><strong>{{ t.name }}</strong><br><small class="muted">{{ t.category }}</small></td>
              <td class="muted hide-sm">{{ t.date | date:'MMM d' }}</td>
              <td class="hide-sm"><span class="badge" [class.pending]="t.status === 'Pending'">{{ t.status }}</span></td>
              <td class="amt" [class]="t.amount > 0 ? 'amt up' : 'amt'">{{ t.amount | currency }}</td>
            </tr>
          }
        </tbody>
      </table>
    </article>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
    .kpi { padding: 18px 20px; display: grid; gap: 4px; }
    .kpi strong { font-size: 26px; letter-spacing: -.02em; }
    .grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
    .pad { padding: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    h2 { font-size: 15px; font-weight: 600; }
    a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .legend { display: flex; gap: 14px; color: var(--muted); font-size: 12px; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    svg { width: 100%; height: auto; } .axis { font-size: 10px; fill: var(--muted); }
    .donut-wrap { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .donut-wrap svg { width: 150px; flex: none; }
    ul { list-style: none; margin: 0; padding: 0; flex: 1; min-width: 140px; display: grid; gap: 8px; }
    li { display: flex; align-items: center; } li span { margin-left: auto; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 12px 0; border-top: 1px solid var(--border); }
    tr:first-child td { border-top: 0; }
    @media (max-width: 560px) { .hide-sm { display: none; } }
    .amt { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
    .badge { background: var(--green-soft); color: var(--green); padding: 2px 10px; border-radius: 99px; font-size: 12px; }
    .badge.pending { background: var(--primary-soft); color: var(--primary); }
    @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class Overview {
  protected readonly data = inject(DataService);
  protected readonly grid = [0, 2000, 4000, 6000];
  protected readonly recent = computed(() => this.data.transactions().slice(0, 6));
  protected readonly kpis = computed(() => {
    const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return [
      { label: 'Net balance', value: usd(24580 + this.data.net()), delta: 4.2, up: true },
      { label: 'Income', value: usd(this.data.totalIncome()), delta: 6.8, up: true },
      { label: 'Expenses', value: usd(this.data.totalExpenses()), delta: 2.1, up: false },
      { label: 'Pending payments', value: String(this.data.pending()), delta: 0.5, up: true },
    ];
  });
  protected readonly slices = computed(() => {
    const cats = this.data.byCategory(); const total = cats.reduce((s, c) => s + c.value, 0);
    const C = 2 * Math.PI * 44; let acc = 0;
    return cats.map(c => {
      const len = (c.value / total) * C; const s = { ...c, pct: (c.value / total) * 100, dash: `${len} ${C - len}`, offset: -acc };
      acc += len; return s;
    });
  });
  protected x(i: number) { return 40 + 36 + i * 72; }
  protected y(v: number) { return 200 - (v / 6000) * 190; }
}
