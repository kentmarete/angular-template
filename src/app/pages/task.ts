import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type State = 'Todo' | 'In progress' | 'Done';
type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
interface Subtask { id: number; title: string; done: boolean; }
interface Activity { who: string; text: string; time: string; comment?: boolean; }

@Component({
  selector: 'app-task',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'editing.set(false)' },
  template: `
    <nav class="crumbs muted" aria-label="Breadcrumb"><a routerLink="/transactions">Tasks</a> / <span>{{ key() }}</span></nav>

    @if (valid()) {
      <div class="layout">
        <div class="main">
          <section class="card head">
            <div class="idrow"><span class="key">{{ key() }}</span><a class="muted proj" routerLink="/teams">{{ project }}</a></div>
            @if (editing()) {
              <input class="title-in" [value]="title()" (input)="title.set($any($event.target).value)" aria-label="Task title" />
            } @else { <h1>{{ title() }}</h1> }
            <div class="chips">
              <span class="chip pri" [class]="priority().toLowerCase()">{{ priority() }}</span>
              <span class="chip st" [class]="stateClass()">{{ state() }}</span>
              <span class="muted small">Created Oct 1, 2026</span>
            </div>
            <div class="actions">
              <a class="btn" routerLink="/teams">Open team</a>
              <button class="btn" type="button" (click)="editing.set(!editing())">{{ editing() ? 'Done editing' : 'Edit' }}</button>
              <button class="btn primary" type="button" (click)="toggleDone()">{{ state() === 'Done' ? 'Reopen' : 'Mark done' }}</button>
            </div>
          </section>

          <section class="card pad">
            <h2>Description</h2>
            @if (editing()) {
              <textarea rows="5" [value]="desc()" (input)="desc.set($any($event.target).value)" aria-label="Description"></textarea>
            } @else { <p class="body">{{ desc() }}</p> }
          </section>

          <section class="card pad">
            <div class="sh"><h2>Subtasks</h2><span class="muted small">{{ doneCount() }} of {{ subtasks().length }} complete</span></div>
            <div class="bar" role="progressbar" [attr.aria-valuenow]="pct()" aria-valuemin="0" aria-valuemax="100" aria-label="Subtask progress"><span [style.width.%]="pct()"></span></div>
            <ul class="subs">
              @for (s of subtasks(); track s.id) {
                <li><label [class.done]="s.done"><input type="checkbox" [checked]="s.done" (change)="toggle(s.id)" />{{ s.title }}</label></li>
              }
            </ul>
            <form class="add" (submit)="addSub($event)">
              <input [value]="newSub()" (input)="newSub.set($any($event.target).value)" placeholder="Add a subtask…" aria-label="New subtask" />
              <button class="btn" type="submit" [disabled]="!newSub().trim()">Add</button>
            </form>
          </section>

          <section class="card pad">
            <div class="sh"><h2>Attachments</h2><span class="muted small">{{ files().length }}</span></div>
            @if (files().length) {
              <ul class="files">@for (f of files(); track f) { <li>📎 {{ f }}<button type="button" class="x" (click)="removeFile(f)" [attr.aria-label]="'Remove ' + f">✕</button></li> }</ul>
            } @else { <p class="muted small">No files uploaded yet.</p> }
            <label class="btn up">Upload file<input type="file" hidden (change)="upload($event)" /></label>
          </section>

          <section class="card pad">
            <h2>Activity</h2>
            <ol class="feed">
              @for (a of activity(); track $index) {
                <li><span class="av" aria-hidden="true">{{ initials(a.who) }}</span>
                  <div><div><strong>{{ a.who }}</strong> <span class="muted">{{ a.text }}</span></div>
                    @if (a.comment) { <p class="cmt">{{ a.text }}</p> }<small class="muted">{{ a.time }}</small></div></li>
              }
            </ol>
            <form class="add" (submit)="comment($event)">
              <input [value]="draft()" (input)="draft.set($any($event.target).value)" placeholder="Leave a comment…" aria-label="Comment" />
              <button class="btn primary" type="submit" [disabled]="!draft().trim()">Comment</button>
            </form>
          </section>
        </div>

        <aside class="card props" aria-label="Task properties">
          <h2>Properties</h2>
          <dl>
            <dt>State</dt><dd><select [value]="state()" (change)="state.set($any($event.target).value)">@for (s of states; track s) { <option [selected]="s === state()">{{ s }}</option> }</select></dd>
            <dt>Priority</dt><dd><select [value]="priority()" (change)="priority.set($any($event.target).value)">@for (p of priorities; track p) { <option [selected]="p === priority()">{{ p }}</option> }</select></dd>
            <dt>Assignee</dt><dd><span class="av sm" aria-hidden="true">AB</span>Aisha Bello</dd>
            <dt>Reporter</dt><dd><span class="av sm" aria-hidden="true">KM</span>Kenneth Marete</dd>
            <dt>Team</dt><dd><a routerLink="/teams">Accounting</a></dd>
            <dt>Milestone</dt><dd>Q3 close complete</dd>
            <dt>Due date</dt><dd>Oct 30, 2026</dd>
            <dt>Estimate</dt><dd>1 day</dd>
            <dt>Linked</dt><dd><a routerLink="/invoices">Invoices</a> · <a routerLink="/transactions">Transactions</a></dd>
          </dl>
          <div class="labels"><span class="label">reconciliation</span><span class="label">month-end</span><span class="label">payments</span></div>
        </aside>
      </div>
    } @else {
      <section class="card empty"><h2>Task not found</h2><p class="muted">“{{ id() }}” doesn't exist.</p><a class="btn primary" routerLink="/tasks/FIN-36">Go to FIN-36</a></section>
    }
  `,
  styles: `
    :host { display: grid; gap: 16px; max-width: 1100px; }
    .crumbs a { color: var(--primary); text-decoration: none; }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; } .main { display: grid; gap: 16px; min-width: 0; }
    h1 { font-size: 22px; letter-spacing: -.01em; margin: 0; } h2 { font-size: 14px; margin: 0 0 10px; } .small { font-size: 12px; }
    .head, .pad { padding: 20px; } .head { display: grid; gap: 12px; }
    .idrow { display: flex; gap: 10px; align-items: center; } .key { font-weight: 700; font-size: 12px; background: var(--surface-2); padding: 2px 8px; border-radius: 6px; } .proj { font-size: 13px; text-decoration: none; }
    .chips { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .chip { padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; background: var(--surface-2); color: var(--muted); }
    .chip.high, .chip.urgent { background: var(--red-soft); color: var(--red); } .chip.medium { background: var(--primary-soft); color: var(--amber); } .chip.in-progress { background: var(--primary-soft); color: var(--primary); } .chip.done { background: var(--green-soft); color: var(--green); }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); text-decoration: none; display: inline-block; font: inherit; cursor: pointer; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn:disabled { opacity: .5; cursor: not-allowed; }
    input:not([type=checkbox]), select, textarea { font: inherit; color: var(--text); background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; box-sizing: border-box; outline: none; }
    input:focus, select:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); } textarea, .title-in { width: 100%; } .title-in { font-size: 20px; font-weight: 600; }
    .body { margin: 0; line-height: 1.6; color: var(--muted); }
    .sh { display: flex; justify-content: space-between; align-items: baseline; } .sh h2 { margin-bottom: 10px; }
    .bar { height: 6px; border-radius: 99px; background: var(--surface-2); overflow: hidden; margin-bottom: 12px; } .bar span { display: block; height: 100%; background: var(--green); transition: width .2s; }
    .subs, .files, .feed { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 10px; }
    .subs label { display: flex; gap: 10px; align-items: center; } .subs label.done { color: var(--muted); text-decoration: line-through; }
    .add { display: flex; gap: 8px; } .add input { flex: 1; min-width: 0; }
    .files li { display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 8px 12px; border-radius: 8px; font-size: 14px; } .x { border: 0; background: none; color: var(--muted); }
    .up { margin-top: 8px; }
    .feed li { display: grid; grid-template-columns: 32px 1fr; gap: 12px; } .feed div div { font-size: 14px; } .feed small { font-size: 12px; }
    .cmt { margin: 6px 0; padding: 8px 12px; background: var(--surface-2); border-radius: 8px; font-size: 14px; }
    .av { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; font-size: 11px; font-weight: 700; } .av.sm { width: 22px; height: 22px; font-size: 9px; }
    .props { padding: 20px; position: sticky; top: 0; } dl { display: grid; grid-template-columns: 80px 1fr; gap: 12px 8px; margin: 0 0 14px; font-size: 13px; align-items: center; }
    dt { color: var(--muted); } dd { margin: 0; display: flex; gap: 8px; align-items: center; } dd a { color: var(--primary); text-decoration: none; } dd select { width: 100%; padding: 4px 8px; }
    .labels { display: flex; gap: 6px; flex-wrap: wrap; } .label { font-size: 12px; padding: 2px 10px; border-radius: 99px; border: 1px solid var(--border); color: var(--muted); }
    .empty { padding: 48px; text-align: center; display: grid; gap: 10px; justify-items: center; }
    @media (max-width: 900px) { .layout { grid-template-columns: minmax(0, 1fr); } .props { position: static; order: -1; } .head, .pad { padding: 16px; } }
  `,
})
export class TaskPage {
  /** Bound from the `:id` route param, e.g. FIN-36. */
  readonly id = input<string>();
  protected readonly project = 'Q3 close & reconciliation';
  protected readonly states: State[] = ['Todo', 'In progress', 'Done'];
  protected readonly priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

  protected readonly title = signal('Reconcile September card settlements');
  protected readonly desc = signal('Match September card settlement batches against the ledger and bank statements. Differences above $50 must be explained before the books close. Fees and chargebacks are the main risk areas; unresolved variance above 0.5% of volume blocks sign-off.');
  protected readonly state = signal<State>('Todo');
  protected readonly priority = signal<Priority>('High');
  protected readonly editing = signal(false);
  protected readonly subtasks = signal<Subtask[]>([
    { id: 1, title: 'Export processor settlement reports', done: true },
    { id: 2, title: 'Match batches to bank deposits', done: false },
    { id: 3, title: 'Document variances above $50', done: false },
  ]);
  protected readonly newSub = signal('');
  protected readonly files = signal<string[]>([]);
  protected readonly draft = signal('');
  protected readonly activity = signal<Activity[]>([
    { who: 'Marcus Feeney', text: 'Please also include chargeback fees in the variance report.', time: '11 days ago', comment: true },
    { who: 'Kenneth Marete', text: 'created the task', time: '12 days ago' },
  ]);

  protected readonly key = computed(() => (this.id() ?? 'FIN-36').toUpperCase());
  protected readonly valid = computed(() => this.key() === 'FIN-36');
  protected readonly doneCount = computed(() => this.subtasks().filter(s => s.done).length);
  protected readonly pct = computed(() => this.subtasks().length ? Math.round(this.doneCount() / this.subtasks().length * 100) : 0);
  protected readonly stateClass = computed(() => this.state().toLowerCase().replace(' ', '-'));

  protected initials(n: string) { return n.split(' ').map(p => p[0]).join('').slice(0, 2); }
  protected toggle(id: number) { this.subtasks.update(l => l.map(s => s.id === id ? { ...s, done: !s.done } : s)); }
  protected toggleDone() { this.state.set(this.state() === 'Done' ? 'In progress' : 'Done'); }
  protected addSub(e: Event) {
    e.preventDefault(); const t = this.newSub().trim(); if (!t) return;
    this.subtasks.update(l => [...l, { id: Math.max(0, ...l.map(s => s.id)) + 1, title: t, done: false }]); this.newSub.set('');
  }
  protected upload(e: Event) {
    const input = e.target as HTMLInputElement; const f = input.files?.[0];
    if (f) this.files.update(l => [...l, f.name]); input.value = '';
  }
  protected removeFile(n: string) { this.files.update(l => l.filter(f => f !== n)); }
  protected comment(e: Event) {
    e.preventDefault(); const t = this.draft().trim(); if (!t) return;
    this.activity.update(a => [{ who: 'Kenneth Marete', text: t, time: 'Just now', comment: true }, ...a]); this.draft.set('');
  }
}
