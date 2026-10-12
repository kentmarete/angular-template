import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

interface Msg { id: number; mine: boolean; text: string; at: Date; }
interface User { id: number; name: string; role: string; color: string; online: boolean; unread: number; msgs: Msg[]; }

const ago = (min: number) => new Date(Date.now() - min * 60_000);

@Component({
  selector: 'app-chat',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card chat" [class.in-thread]="activeId() !== null">
      <aside class="users">
        <div class="uhead">
          <h2>Messages</h2>
          <input type="search" placeholder="Search people…" aria-label="Search people" (input)="query.set($any($event.target).value)" />
        </div>
        <ul>
          @for (u of filtered(); track u.id) {
            <li>
              <button class="user" [class.active]="u.id === activeId()" (click)="select(u.id)">
                <span class="av" [style.background]="u.color">{{ initials(u.name) }}<i class="dot" [class.on]="u.online"></i></span>
                <span class="meta">
                  <strong>{{ u.name }}</strong>
                  <small class="muted">{{ last(u)?.text ?? 'No messages yet' }}</small>
                </span>
                <span class="side">
                  <small class="muted">{{ last(u)?.at | date:'shortTime' }}</small>
                  @if (u.unread) { <span class="count">{{ u.unread }}</span> }
                </span>
              </button>
            </li>
          } @empty { <li class="muted none">No one found.</li> }
        </ul>
      </aside>

      <section class="thread">
        @if (active(); as u) {
          <header>
            <button class="back" (click)="activeId.set(null)" aria-label="Back to people">‹</button>
            <span class="av" [style.background]="u.color">{{ initials(u.name) }}<i class="dot" [class.on]="u.online"></i></span>
            <div><strong>{{ u.name }}</strong><br><small class="muted">{{ u.online ? 'Online' : 'Offline' }} · {{ u.role }}</small></div>
          </header>
          <div class="msgs" #scroller role="log" aria-live="polite">
            @for (m of u.msgs; track m.id) {
              <div class="msg" [class.mine]="m.mine">
                <p>{{ m.text }}</p>
                <small class="muted">{{ m.at | date:'shortTime' }}</small>
              </div>
            } @empty { <p class="muted none">Say hi to {{ u.name }} 👋</p> }
          </div>
          <form class="composer" (submit)="send($event, box)">
            <input #box placeholder="Type a message…" aria-label="Message" autocomplete="off" />
            <button class="btn primary" type="submit">Send</button>
          </form>
        } @else {
          <p class="muted pick">Select a conversation to start chatting.</p>
        }
      </section>
    </div>
  `,
  styles: `
    .chat { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 112px); min-height: 420px; overflow: hidden; }
    .users { border-right: 1px solid var(--border); display: flex; flex-direction: column; min-height: 0; }
    .uhead { padding: 16px; display: grid; gap: 12px; border-bottom: 1px solid var(--border); }
    h2 { font-size: 16px; font-weight: 600; }
    input { width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 12px; font: inherit; outline: none; }
    input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    ul { list-style: none; margin: 0; padding: 6px; overflow-y: auto; flex: 1; }
    .user { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px; border: 0; background: none; border-radius: 10px; text-align: left; }
    .user:hover { background: var(--surface-2); } .user.active { background: var(--primary-soft); }
    .av { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; color: #fff; display: grid; place-items: center; font-size: 13px; font-weight: 600; }
    .dot { position: absolute; right: 0; bottom: 0; width: 11px; height: 11px; border-radius: 50%; background: var(--muted); border: 2px solid var(--surface); }
    .dot.on { background: var(--green); }
    .meta { display: grid; min-width: 0; flex: 1; }
    .meta strong, .meta small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .side { display: grid; justify-items: end; gap: 4px; } .side small { font-size: 11px; }
    .count { background: var(--primary); color: #fff; border-radius: 99px; min-width: 18px; height: 18px; padding: 0 5px; font-size: 11px; font-weight: 600; display: grid; place-items: center; }
    .none { padding: 24px; text-align: center; }
    .thread { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .thread header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
    .back { display: none; border: 0; background: none; font-size: 24px; line-height: 1; padding: 0 6px; }
    .msgs { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .msg { max-width: 70%; align-self: flex-start; display: grid; gap: 2px; }
    .msg p { background: var(--surface-2); padding: 9px 14px; border-radius: 14px 14px 14px 4px; overflow-wrap: anywhere; }
    .msg small { font-size: 11px; padding: 0 4px; }
    .msg.mine { align-self: flex-end; justify-items: end; }
    .msg.mine p { background: var(--primary); color: #fff; border-radius: 14px 14px 4px 14px; }
    .composer { display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border); }
    .btn { padding: 9px 20px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .pick { margin: auto; }
    @media (max-width: 760px) {
      .chat { grid-template-columns: 1fr; height: calc(100vh - 100px); }
      .chat.in-thread .users, .chat:not(.in-thread) .thread { display: none; }
      .back { display: block; } .msg { max-width: 85%; }
    }
  `,
})
export class Chat {
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private nextId = 100;
  protected readonly query = signal('');
  protected readonly activeId = signal<number | null>(1);

  protected readonly users = signal<User[]>([
    { id: 1, name: 'Amina Otieno', role: 'Finance', color: '#1b84ff', online: true, unread: 0, msgs: [
      { id: 1, mine: false, text: 'Hi! Did the October payroll go out?', at: ago(42) },
      { id: 2, mine: true, text: 'Yes, it landed this morning. Receipt is in the transactions page.', at: ago(38) },
      { id: 3, mine: false, text: 'Perfect, thanks. Can you share the Q3 budget summary too?', at: ago(35) },
    ] },
    { id: 2, name: 'Brian Mutua', role: 'Engineering', color: '#7c5cfc', online: true, unread: 2, msgs: [
      { id: 1, mine: true, text: 'Is the new dashboard build ready for review?', at: ago(190) },
      { id: 2, mine: false, text: 'Almost, just finishing the table pagination.', at: ago(120) },
      { id: 3, mine: false, text: 'Will ping you in 10 min.', at: ago(118) },
    ] },
    { id: 3, name: 'Chloe Wanjiru', role: 'Design', color: '#14b8a6', online: false, unread: 0, msgs: [
      { id: 1, mine: false, text: 'Uploaded the new icon set to Figma.', at: ago(1500) },
    ] },
    { id: 4, name: 'David Kamau', role: 'Marketing', color: '#f59e0b', online: false, unread: 1, msgs: [
      { id: 1, mine: false, text: 'Campaign numbers look great this week 🎉', at: ago(2900) },
    ] },
    { id: 5, name: 'Esther Kariuki', role: 'Support', color: '#ec4899', online: true, unread: 0, msgs: [] },
  ]);

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase(); return this.users().filter(u => u.name.toLowerCase().includes(q));
  });
  protected readonly active = computed(() => this.users().find(u => u.id === this.activeId()) ?? null);

  constructor() {
    effect(() => {
      this.active(); // re-run on conversation or message changes
      const el = this.scroller()?.nativeElement;
      if (el) requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
    });
  }

  protected initials(n: string) { return n.split(' ').map(p => p[0]).join(''); }
  protected last(u: User) { return u.msgs.at(-1); }
  protected select(id: number) {
    this.activeId.set(id);
    this.users.update(l => l.map(u => (u.id === id ? { ...u, unread: 0 } : u)));
  }
  protected send(e: Event, box: HTMLInputElement) {
    e.preventDefault();
    const text = box.value.trim(); const id = this.activeId();
    if (!text || id === null) return;
    this.users.update(l => l.map(u => (u.id === id ? { ...u, msgs: [...u.msgs, { id: this.nextId++, mine: true, text, at: new Date() }] } : u)));
    box.value = '';
  }
}
