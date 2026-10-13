import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TabItem, Tabs } from '../core/tabs';

type Status = 'Open' | 'Pending' | 'Resolved';
type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
interface Ticket { id: number; subject: string; bucket: string; requester: string; status: Status; priority: Priority; date: string; channel: string; }
interface Message { id: number; from: string; role: string; time: string; body: string; kind: 'customer' | 'agent' | 'note'; }

@Component({
  selector: 'app-ticket',
  imports: [CurrencyPipe, RouterLink, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="crumbs muted" aria-label="Breadcrumb"><a routerLink="/tickets/4210">Tickets</a> / <span>#{{ current()?.id ?? '—' }}</span></nav>

    <div class="layout">
      <!-- Ticket list -->
      <aside class="card list" aria-label="Tickets">
        <div class="lhead"><h2>Tickets</h2><button class="btn primary sm" type="button">+ New</button></div>
        <div class="views" role="group" aria-label="Filter tickets">
          @for (v of views; track v.id) {
            <button type="button" [class.on]="view() === v.id" [attr.aria-pressed]="view() === v.id" (click)="view.set(v.id)">
              {{ v.label }} <span class="count">{{ countFor(v.id) }}</span>
            </button>
          }
        </div>
        <ul>
          @for (t of visible(); track t.id) {
            <li>
              <a [routerLink]="['/tickets', t.id]" [class.active]="t.id === current()?.id" [attr.aria-current]="t.id === current()?.id ? 'page' : null">
                <span class="row1"><strong>{{ t.subject }}</strong></span>
                <span class="row2 muted">{{ t.requester }} · {{ t.bucket }}</span>
                <span class="row3"><span class="tag" [class]="t.status.toLowerCase()">{{ t.status }}</span><small class="muted">{{ t.date }} · #{{ t.id }}</small></span>
              </a>
            </li>
          } @empty { <li class="muted empty">No tickets in this view.</li> }
        </ul>
      </aside>

      @if (current(); as t) {
        <!-- Conversation -->
        <section class="card convo">
          <header class="chead">
            <div>
              <h1>{{ t.subject }}</h1>
              <div class="meta muted">#{{ t.id }} · {{ t.channel }} · {{ t.bucket }}</div>
            </div>
            <div class="controls">
              <label>Status
                <select [value]="status()" (change)="status.set($any($event.target).value)">
                  @for (s of statuses; track s) { <option [selected]="s === status()">{{ s }}</option> }
                </select>
              </label>
              <label>Priority
                <select [value]="priority()" (change)="priority.set($any($event.target).value)">
                  @for (p of priorities; track p) { <option [selected]="p === priority()">{{ p }}</option> }
                </select>
              </label>
            </div>
          </header>

          <div class="tabbar"><app-tabs [items]="tabs()" [(value)]="tab" label="Ticket sections" /></div>

          @if (tab() === 'conversation') {
            <ol class="thread">
              @for (m of messages(); track m.id) {
                <li class="msg" [class]="m.kind">
                  <span class="av" aria-hidden="true">{{ initials(m.from) }}</span>
                  <div class="bubble">
                    <div class="mh"><strong>{{ m.from }}</strong><span class="muted">{{ m.role }}</span>
                      @if (m.kind === 'note') { <span class="tag note">Internal note</span> }
                      <small class="muted">{{ m.time }}</small></div>
                    <p>{{ m.body }}</p>
                  </div>
                </li>
              }
            </ol>

            <form class="composer" (submit)="send($event)">
              <div class="mode" role="group" aria-label="Reply type">
                <button type="button" [class.on]="mode() === 'reply'" [attr.aria-pressed]="mode() === 'reply'" (click)="mode.set('reply')">Reply</button>
                <button type="button" [class.on]="mode() === 'note'" [attr.aria-pressed]="mode() === 'note'" (click)="mode.set('note')">Internal note</button>
              </div>
              <textarea rows="3" [value]="draft()" (input)="draft.set($any($event.target).value)"
                [placeholder]="mode() === 'reply' ? 'Write a reply to ' + t.requester + '…' : 'Add a private note for your team…'"
                [attr.aria-label]="mode() === 'reply' ? 'Reply' : 'Internal note'"></textarea>
              <div class="actions">
                <small class="muted">{{ mode() === 'reply' ? 'Visible to the customer' : 'Only visible to agents' }}</small>
                <button class="btn primary" type="submit" [disabled]="!draft().trim()">{{ mode() === 'reply' ? 'Send reply' : 'Add note' }}</button>
              </div>
            </form>
          } @else {
            <ol class="activity">
              @for (a of activity; track $index) {
                <li><span class="dot"></span><div><span>{{ a.text }}</span><small class="muted">{{ a.time }}</small></div></li>
              }
            </ol>
          }
        </section>

        <!-- Customer + linked transaction -->
        <aside class="side">
          <section class="card cust">
            <div class="who"><span class="av lg" aria-hidden="true">{{ initials(t.requester) }}</span>
              <div><strong>{{ t.requester }}</strong> <span class="tag vip">Premium</span><small class="muted">aisha.bello&#64;meridian.example</small></div></div>
            <dl>
              <dt>Account</dt><dd>•••• 4821 · Business</dd>
              <dt>Company</dt><dd>Meridian Consulting</dd>
              <dt>Location</dt><dd>Chicago, US</dd>
              <dt>Customer since</dt><dd>Mar 2024</dd>
            </dl>
          </section>

          <section class="card linked">
            <h3>Linked transaction</h3>
            <div class="txn">
              <div><strong>Fresh Market</strong><small class="muted">Oct 9, 2026 · Food</small></div>
              <strong class="neg">{{ -86.4 | currency }}</strong>
            </div>
            <a class="link" routerLink="/transactions">View in transactions →</a>
          </section>

          <section class="card prev">
            <h3>Previous conversations</h3>
            <ul>
              @for (p of previous; track p.id) {
                <li><a [routerLink]="['/tickets', p.id]"><span>{{ p.subject }}</span><small class="muted">#{{ p.id }} · {{ p.date }}</small></a>
                  <span class="tag" [class]="p.status.toLowerCase()">{{ p.status }}</span></li>
              }
            </ul>
          </section>
        </aside>
      } @else {
        <section class="card empty-state"><h2>Ticket not found</h2><p class="muted">It may have been closed or removed.</p><a class="btn primary" routerLink="/tickets/4210">Back to tickets</a></section>
      }
    </div>
  `,
  styles: `
    :host { display: grid; gap: 16px; }
    .crumbs a { color: var(--primary); text-decoration: none; }
    .layout { display: grid; grid-template-columns: 300px minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
    h1 { font-size: 20px; letter-spacing: -.01em; margin: 0; } h2 { font-size: 16px; margin: 0; } h3 { font-size: 13px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; display: inline-block; }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.sm { padding: 5px 12px; font-size: 13px; } .btn:disabled { opacity: .5; cursor: not-allowed; }
    .tag { padding: 1px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; background: var(--surface-2); color: var(--muted); white-space: nowrap; }
    .tag.open { background: var(--primary-soft); color: var(--primary); } .tag.pending { background: var(--red-soft); color: var(--amber); } .tag.resolved { background: var(--green-soft); color: var(--green); }
    .tag.vip { background: var(--primary-soft); color: var(--violet); margin-left: 4px; } .tag.note { background: var(--primary-soft); color: var(--amber); }

    .list { padding: 14px; display: grid; gap: 12px; max-height: calc(100vh - 140px); overflow: auto; position: sticky; top: 0; }
    .lhead { display: flex; justify-content: space-between; align-items: center; }
    .views { display: flex; flex-wrap: wrap; gap: 6px; }
    .views button { border: 1px solid var(--border); background: none; color: var(--muted); padding: 4px 10px; border-radius: 99px; font-size: 12px; }
    .views button.on { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); } .count { margin-left: 4px; font-weight: 600; }
    .list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .list li a { display: grid; gap: 3px; padding: 10px; border-radius: 10px; color: inherit; text-decoration: none; border: 1px solid transparent; }
    .list li a:hover { background: var(--surface-2); } .list li a.active { background: var(--primary-soft); border-color: var(--primary); }
    .row1 strong { font-size: 13px; } .row2 { font-size: 12px; } .row3 { display: flex; justify-content: space-between; align-items: center; gap: 8px; } .empty { padding: 12px; }

    .convo { display: grid; align-content: start; min-width: 0; }
    .chead { display: flex; justify-content: space-between; gap: 16px; padding: 20px 20px 8px; flex-wrap: wrap; }
    .meta { font-size: 13px; margin-top: 4px; }
    .controls { display: flex; gap: 12px; } .controls label { display: grid; gap: 3px; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
    select, textarea { font: inherit; color: var(--text); background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 7px 10px; text-transform: none; letter-spacing: 0; }
    textarea { width: 100%; resize: vertical; box-sizing: border-box; } select:focus-visible, textarea:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
    .tabbar { padding: 0 12px; border-bottom: 1px solid var(--border); }
    .thread, .activity { list-style: none; margin: 0; padding: 20px; display: grid; gap: 18px; }
    .msg { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 12px; }
    .av { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; font-size: 12px; font-weight: 700; } .av.lg { width: 44px; height: 44px; font-size: 14px; }
    .msg.agent .av { background: var(--green-soft); color: var(--green); }
    .bubble { background: var(--surface-2); border-radius: 12px; padding: 12px 14px; } .msg.note .bubble { background: var(--primary-soft); border: 1px dashed var(--amber); }
    .mh { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; } .mh small { margin-left: auto; }
    .bubble p { margin: 8px 0 0; line-height: 1.55; font-size: 14px; }
    .composer { border-top: 1px solid var(--border); padding: 16px 20px 20px; display: grid; gap: 10px; }
    .mode { display: inline-flex; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 8px; justify-self: start; }
    .mode button { border: 0; background: none; padding: 5px 14px; border-radius: 6px; color: var(--muted); font-weight: 500; } .mode button.on { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }
    .actions { display: flex; justify-content: space-between; align-items: center; }
    .activity li { display: grid; grid-template-columns: 12px 1fr; gap: 12px; } .activity .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 6px; } .activity div { display: grid; gap: 2px; }

    .side { display: grid; gap: 16px; } .side .card { padding: 16px; }
    .who { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; } .who div { display: grid; gap: 2px; } .who small { font-size: 12px; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0; font-size: 13px; } dt { color: var(--muted); } dd { margin: 0; text-align: right; }
    .txn { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px; } .txn div { display: grid; gap: 2px; } .neg { color: var(--red); }
    .link { color: var(--primary); text-decoration: none; font-size: 13px; }
    .prev ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; } .prev li { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
    .prev a { display: grid; gap: 2px; color: var(--text); text-decoration: none; font-size: 13px; } .prev a:hover span { color: var(--primary); }
    .empty-state { grid-column: 2 / -1; padding: 48px; text-align: center; display: grid; gap: 10px; justify-items: center; }

    @media (max-width: 1180px) { .layout { grid-template-columns: 260px minmax(0, 1fr); } .side { grid-column: 1 / -1; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); } }
    @media (max-width: 760px) { .layout { grid-template-columns: minmax(0, 1fr); } .list { position: static; max-height: 320px; } .empty-state { grid-column: 1; } .chead { padding: 16px 16px 8px; } .thread, .activity { padding: 16px; } }
  `,
})
export class TicketPage {
  /** Bound from the `:id` route param. */
  readonly id = input<string>();

  protected readonly statuses: Status[] = ['Open', 'Pending', 'Resolved'];
  protected readonly priorities: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];
  protected readonly views = [
    { id: 'all', label: 'All' }, { id: 'open', label: 'Open' }, { id: 'pending', label: 'Pending' }, { id: 'urgent', label: 'Urgent' }, { id: 'resolved', label: 'Resolved' },
  ];
  protected readonly view = signal('all');
  protected readonly tab = signal('conversation');
  protected readonly mode = signal<'reply' | 'note'>('reply');
  protected readonly draft = signal('');

  protected readonly tickets: Ticket[] = [
    { id: 4210, subject: 'Unrecognised charge on Fresh Market', bucket: 'Disputes', requester: 'Aisha Bello', status: 'Pending', priority: 'High', date: 'Oct 11', channel: 'Via email' },
    { id: 4209, subject: 'Payroll deposit not showing', bucket: 'Payments', requester: 'Samuel Ortiz', status: 'Open', priority: 'Urgent', date: 'Oct 11', channel: 'Via chat' },
    { id: 4208, subject: 'Request to raise card limit', bucket: 'Accounts', requester: 'Mei Tanaka', status: 'Open', priority: 'Normal', date: 'Oct 10', channel: 'Via email' },
    { id: 4207, subject: 'Export statements as CSV', bucket: 'Feature requests', requester: 'Daniel Okoye', status: 'Pending', priority: 'Low', date: 'Oct 9', channel: 'Via web' },
    { id: 4206, subject: 'Duplicate subscription fee', bucket: 'Billing', requester: 'Lena Fischer', status: 'Resolved', priority: 'Normal', date: 'Oct 8', channel: 'Via email' },
    { id: 4205, subject: 'Cannot link external bank account', bucket: 'Accounts', requester: 'Priya Nair', status: 'Resolved', priority: 'High', date: 'Oct 7', channel: 'Via chat' },
  ];
  protected readonly previous = [
    { id: 4188, subject: 'Update billing address', status: 'Resolved' as Status, date: 'Sep 14' },
    { id: 4102, subject: 'Card replacement request', status: 'Resolved' as Status, date: 'Aug 2' },
    { id: 4004, subject: 'Statement missing for June', status: 'Resolved' as Status, date: 'Jun 21' },
  ];
  protected readonly activity = [
    { text: 'Aisha Bello opened the ticket via email', time: 'Oct 11, 9:12 AM' },
    { text: 'Auto-assigned to Janis Considine (Disputes)', time: 'Oct 11, 9:12 AM' },
    { text: 'Priority set to High', time: 'Oct 11, 9:40 AM' },
    { text: 'Janis replied with dispute form', time: 'Oct 11, 9:55 AM' },
    { text: 'Internal note added', time: 'Oct 11, 10:05 AM' },
  ];

  protected readonly messages = signal<Message[]>([
    { id: 1, from: 'Aisha Bello', role: 'Customer', time: 'Oct 11, 9:12 AM', kind: 'customer',
      body: 'Hi, I see an $86.40 charge from Fresh Market on Oct 9 that I don\'t recognise. My card was in my possession the whole time. Could you look into it and let me know what happens next? I\'d like this sorted before my statement closes on Friday.' },
    { id: 2, from: 'Janis Considine', role: 'Support Lead', time: 'Oct 11, 9:55 AM', kind: 'agent',
      body: 'Thanks for flagging this, Aisha. I\'ve started a dispute and temporarily frozen the card ending 4821 as a precaution. A replacement card will arrive in 3–5 business days. The merchant has up to 10 days to respond; we\'ll update you as soon as they do.' },
    { id: 3, from: 'Janis Considine', role: 'Support Lead', time: 'Oct 11, 10:05 AM', kind: 'note',
      body: 'Provisional credit approved by Risk. Merchant response typically takes 5–7 days — check back Oct 18.' },
  ]);

  protected readonly status = signal<Status>('Pending');
  protected readonly priority = signal<Priority>('High');

  protected readonly current = computed(() => this.tickets.find(t => t.id === Number(this.id() ?? 4210)));
  protected readonly tabs = computed<TabItem[]>(() => [
    { id: 'conversation', label: 'Conversation', badge: this.messages().length },
    { id: 'activity', label: 'Activity' },
  ]);
  protected readonly visible = computed(() => this.tickets.filter(t => this.matches(t, this.view())));

  protected countFor(v: string) { return this.tickets.filter(t => this.matches(t, v)).length; }
  protected initials(name: string) { return name.split(' ').map(p => p[0]).join('').slice(0, 2); }

  protected send(e: Event) {
    e.preventDefault();
    const body = this.draft().trim();
    if (!body) return;
    const note = this.mode() === 'note';
    this.messages.update(m => [...m, { id: m.length + 1, from: 'Kenneth Marete', role: 'Agent', time: 'Just now', kind: note ? 'note' : 'agent', body }]);
    this.draft.set('');
  }

  private matches(t: Ticket, v: string) {
    switch (v) {
      case 'open': return t.status === 'Open';
      case 'pending': return t.status === 'Pending';
      case 'resolved': return t.status === 'Resolved';
      case 'urgent': return t.priority === 'Urgent' || t.priority === 'High';
      default: return true;
    }
  }
}
