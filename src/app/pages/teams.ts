import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface Person { name: string; title: string; }
interface Team { id: number; name: string; description: string; lead: string; members: string[]; accounts: number; }

const COLORS = ['#1b84ff', '#7c5cfc', '#14b8a6', '#f59e0b', '#ec4899', '#17a34a', '#e5484d'];
const PEOPLE: Person[] = [
  { name: 'Kenneth Marete', title: 'Finance Director' }, { name: 'Aisha Bello', title: 'Controller' }, { name: 'Samuel Ortiz', title: 'Payments Engineer' },
  { name: 'Mei Tanaka', title: 'Treasury Analyst' }, { name: 'Daniel Okoye', title: 'Data Analyst' }, { name: 'Lena Fischer', title: 'Billing Specialist' },
  { name: 'Priya Nair', title: 'Compliance Officer' }, { name: 'Marcus Feeney', title: 'Risk Manager' }, { name: 'Janis Considine', title: 'Support Lead' },
  { name: 'Clara Moreau', title: 'Support Agent' }, { name: 'Hugo Braun', title: 'Auditor' }, { name: 'Noor Haddad', title: 'Analyst' },
];

@Component({
  selector: 'app-teams',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'creating.set(false)' },
  template: `
    <header class="head">
      <div><h2>Teams</h2><p class="muted">Who works together, who leads them and what they own.</p></div>
      <div class="tools">
        <input type="search" placeholder="Search teams…" aria-label="Search teams" (input)="query.set($any($event.target).value)" />
        <button class="btn primary" type="button" (click)="open()">＋ New team</button>
      </div>
    </header>

    <div class="grid">
      @for (t of rows(); track t.id) {
        <article class="card team">
          <div class="top"><h3>{{ t.name }}</h3><button class="ib" type="button" (click)="remove(t.id)" [attr.aria-label]="'Delete ' + t.name" title="Delete team">🗑</button></div>
          <p class="muted desc">{{ t.description }}</p>
          <div class="lead"><span class="av" [style.background]="color(t.lead)">{{ initials(t.lead) }}</span><span><strong>{{ t.lead }}</strong><small class="muted">Lead</small></span></div>
          <div class="stack" [attr.aria-label]="t.members.length + ' members'">
            @for (m of t.members.slice(0, 4); track m) { <span class="av sm" [style.background]="color(m)" [title]="m">{{ initials(m) }}</span> }
            @if (t.members.length > 4) { <span class="av sm more">+{{ t.members.length - 4 }}</span> }
          </div>
          <footer class="muted"><span>{{ t.members.length }} members</span><span>{{ t.accounts }} accounts</span></footer>
        </article>
      } @empty { <p class="card muted empty">No teams match “{{ query() }}”.</p> }
    </div>

    @if (creating()) {
      <div class="overlay" (click)="creating.set(false)">
        <form class="modal card" role="dialog" aria-modal="true" aria-label="New team" (click)="$event.stopPropagation()" (submit)="save($event)">
          <h3>New team</h3>
          <label>Name<input required [value]="name()" (input)="name.set($any($event.target).value)" placeholder="e.g. Treasury" /></label>
          <label>Description<textarea rows="2" [value]="desc()" (input)="desc.set($any($event.target).value)" placeholder="What does this team own?"></textarea></label>
          <label>Lead<select (change)="lead.set($any($event.target).value)">@for (p of people; track p.name) { <option [value]="p.name" [selected]="p.name === lead()">{{ p.name }} — {{ p.title }}</option> }</select></label>
          <fieldset><legend>Members</legend>
            <div class="picks">@for (p of people; track p.name) {
              <label class="pick"><input type="checkbox" [checked]="picked().includes(p.name)" (change)="toggle(p.name)" />{{ p.name }}</label>
            }</div>
          </fieldset>
          <div class="foot"><button class="btn" type="button" (click)="creating.set(false)">Cancel</button><button class="btn primary" type="submit" [disabled]="!name().trim()">Create team</button></div>
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: grid; gap: 20px; }
    .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; } h2 { font-size: 18px; margin: 0; } h3 { font-size: 16px; margin: 0; } .head p { margin: 4px 0 0; }
    .tools { display: flex; gap: 10px; flex-wrap: wrap; }
    input, select, textarea { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 8px 12px; font: inherit; outline: none; box-sizing: border-box; width: 100%; }
    .tools input { width: auto; } input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn:disabled { opacity: .5; cursor: not-allowed; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .team { padding: 18px; display: grid; gap: 14px; align-content: start; } .top { display: flex; justify-content: space-between; align-items: center; } .desc { margin: 0; font-size: 13px; line-height: 1.5; min-height: 40px; }
    .ib { border: 0; background: none; opacity: .5; border-radius: 6px; padding: 4px; } .ib:hover, .ib:focus-visible { opacity: 1; background: var(--red-soft); }
    .lead { display: flex; align-items: center; gap: 10px; } .lead span:last-child { display: grid; font-size: 14px; } .lead small { font-size: 12px; }
    .av { width: 34px; height: 34px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none; }
    .stack { display: flex; } .av.sm { width: 28px; height: 28px; font-size: 11px; border: 2px solid var(--surface); margin-left: -8px; } .av.sm:first-child { margin-left: 0; } .av.more { background: var(--surface-2); color: var(--muted); }
    footer { display: flex; justify-content: space-between; font-size: 12px; border-top: 1px solid var(--border); padding-top: 12px; }
    .empty { grid-column: 1 / -1; padding: 32px; text-align: center; }
    .overlay { position: fixed; inset: 0; background: rgb(0 0 0 / .5); display: grid; place-items: center; z-index: 60; padding: 16px; }
    .modal { width: min(460px, 100%); max-height: 90vh; overflow: auto; padding: 22px; display: grid; gap: 14px; }
    .modal label { display: grid; gap: 5px; font-size: 13px; color: var(--muted); } .modal label > :not(:first-child) { color: var(--text); }
    fieldset { border: 1px solid var(--border); border-radius: 8px; margin: 0; padding: 10px 12px; } legend { font-size: 13px; color: var(--muted); padding: 0 4px; }
    .picks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; } .modal .pick { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: 13px; } .pick input { width: auto; }
    @media (max-width: 600px) { .tools { width: 100%; } .tools input { flex: 1; min-width: 0; } .picks { grid-template-columns: 1fr; } .grid { grid-template-columns: minmax(0, 1fr); } }
    .foot { display: flex; justify-content: flex-end; gap: 10px; }
  `,
})
export class Teams {
  protected readonly people = PEOPLE;
  protected readonly teams = signal<Team[]>([
    { id: 1, name: 'Accounting', description: 'General ledger, month-end close and financial reporting', lead: 'Aisha Bello', members: ['Aisha Bello', 'Kenneth Marete', 'Hugo Braun', 'Lena Fischer', 'Noor Haddad'], accounts: 12 },
    { id: 2, name: 'Payments', description: 'Card processing, payouts and reconciliation', lead: 'Samuel Ortiz', members: ['Samuel Ortiz', 'Mei Tanaka', 'Daniel Okoye', 'Marcus Feeney', 'Clara Moreau', 'Noor Haddad'], accounts: 9 },
    { id: 3, name: 'Treasury', description: 'Cash positions, liquidity and bank relationships', lead: 'Mei Tanaka', members: ['Mei Tanaka', 'Kenneth Marete', 'Aisha Bello', 'Daniel Okoye'], accounts: 7 },
    { id: 4, name: 'Compliance', description: 'KYC, audit trail and regulatory reporting', lead: 'Priya Nair', members: ['Priya Nair', 'Hugo Braun', 'Marcus Feeney', 'Aisha Bello'], accounts: 4 },
    { id: 5, name: 'Billing', description: 'Invoicing, subscriptions and collections', lead: 'Lena Fischer', members: ['Lena Fischer', 'Daniel Okoye', 'Janis Considine'], accounts: 6 },
    { id: 6, name: 'Support', description: 'Customer disputes, tickets and help center', lead: 'Janis Considine', members: ['Janis Considine', 'Clara Moreau', 'Priya Nair', 'Noor Haddad'], accounts: 3 },
  ]);
  protected readonly query = signal('');
  protected readonly creating = signal(false);
  protected readonly name = signal('');
  protected readonly desc = signal('');
  protected readonly lead = signal(PEOPLE[0].name);
  protected readonly picked = signal<string[]>([]);
  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.teams().filter(t => !q || `${t.name} ${t.description} ${t.lead}`.toLowerCase().includes(q));
  });

  protected color(n: string) { return COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]; }
  protected initials(n: string) { return n.split(' ').map(p => p[0]).join('').slice(0, 2); }
  protected open() { this.name.set(''); this.desc.set(''); this.lead.set(PEOPLE[0].name); this.picked.set([]); this.creating.set(true); }
  protected toggle(n: string) { this.picked.update(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]); }
  protected remove(id: number) { this.teams.update(t => t.filter(x => x.id !== id)); }
  protected save(e: Event) {
    e.preventDefault();
    const name = this.name().trim(); if (!name) return;
    const members = [this.lead(), ...this.picked().filter(m => m !== this.lead())];
    this.teams.update(t => [...t, { id: Math.max(0, ...t.map(x => x.id)) + 1, name, description: this.desc().trim() || 'No description yet', lead: this.lead(), members, accounts: 0 }]);
    this.creating.set(false);
  }
}
