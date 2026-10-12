import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Tooltip, Side } from '../core/tooltip';
import { Popover } from '../core/popover';

@Component({
  selector: 'app-tooltips',
  imports: [Tooltip, Popover],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card pad">
      <h2>Tooltip positions <span class="muted">hover or focus</span></h2>
      <div class="row">
        @for (s of sides; track s) { <button class="btn" [appTooltip]="'Tooltip on ' + s" [tooltipPosition]="s">{{ s }}</button> }
      </div>
    </section>

    <section class="card pad">
      <h2>Tooltips on icons &amp; text</h2>
      <div class="row">
        <button class="btn icon" appTooltip="Add new" aria-label="Add new">＋</button>
        <button class="btn icon" appTooltip="Download report" tooltipPosition="bottom" aria-label="Download report">⭳</button>
        <button class="btn icon danger" appTooltip="Delete permanently" aria-label="Delete permanently">🗑</button>
        <span class="muted">Your balance <span class="hint" tabindex="0" appTooltip="Includes pending transactions of $132.75">(?)</span></span>
        <span class="muted">Hover <u tabindex="0" appTooltip="Annual Percentage Yield: the real rate of return after compounding">APY</u> for the definition</span>
      </div>
    </section>

    <section class="card pad">
      <h2>Popover positions <span class="muted">click to open · Esc or outside click closes</span></h2>
      <div class="row spread">
        @for (s of sides; track s) {
          <app-popover #p [position]="s" [heading]="'Popover ' + s">
            <button trigger class="btn" [attr.aria-expanded]="p.open()">{{ s }}</button>
            This popover opens on the {{ s }} side of its trigger.
          </app-popover>
        }
      </div>
    </section>

    <section class="card pad">
      <h2>Popover with content</h2>
      <div class="row">
        <app-popover #info position="bottom" heading="About this metric">
          <button trigger class="btn" [attr.aria-expanded]="info.open()">ⓘ Net balance</button>
          Net balance is income minus expenses for the current month, including pending items.
        </app-popover>

        <app-popover #del position="bottom" heading="Delete this transaction?">
          <button trigger class="btn danger" [attr.aria-expanded]="del.open()">Delete</button>
          This action can't be undone.
          <div class="acts">
            <button class="btn sm" (click)="del.open.set(false)">Cancel</button>
            <button class="btn sm solid" (click)="remove(del)">Delete</button>
          </div>
        </app-popover>

        <app-popover #user position="bottom">
          <button trigger class="btn user" [attr.aria-expanded]="user.open()"><span class="av">KM</span> Kenneth Marete</button>
          <div class="card-user">
            <span class="av big">KM</span>
            <div><strong>Kenneth Marete</strong><br><small>Finance Lead · Nairobi</small></div>
          </div>
          <div class="acts"><button class="btn sm" (click)="user.open.set(false)">Message</button><button class="btn sm solid" (click)="user.open.set(false)">View profile</button></div>
        </app-popover>

        <app-popover #share position="top" heading="Share link">
          <button trigger class="btn" [attr.aria-expanded]="share.open()">Share</button>
          <input readonly value="https://fin.example.com/r/q3" aria-label="Share link" />
          <button class="btn sm solid" (click)="copied.set(true); share.open.set(false)">{{ copied() ? 'Copied!' : 'Copy link' }}</button>
        </app-popover>
      </div>
      @if (removed()) { <p class="muted">Transaction deleted (demo).</p> }
    </section>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    .pad { padding: 20px 20px 28px; display: grid; gap: 16px; }
    h2 { font-size: 15px; font-weight: 600; } h2 .muted { font-weight: 400; font-size: 13px; margin-left: 8px; }
    .row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; } .spread { padding: 56px 40px; justify-content: space-around; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
    .row > .btn:not(.icon):not(.user), .spread .btn { text-transform: capitalize; }
    .btn.icon { width: 38px; height: 38px; padding: 0; font-size: 16px; text-transform: none; } .btn.danger { color: var(--red); }
    .btn.sm { padding: 5px 12px; font-size: 13px; } .btn.solid { background: var(--primary); border-color: var(--primary); color: #fff; }
    .btn.user { display: inline-flex; align-items: center; gap: 8px; text-transform: none; }
    .hint, u { cursor: help; color: var(--primary); text-underline-offset: 3px; } .hint { text-decoration: none; }
    .acts { display: flex; gap: 8px; justify-content: flex-end; }
    .av { width: 24px; height: 24px; border-radius: 50%; background: var(--violet); color: #fff; display: grid; place-items: center; font-size: 10px; font-weight: 600; }
    .card-user { display: flex; gap: 12px; align-items: center; min-width: 200px; color: var(--text); } .av.big { width: 40px; height: 40px; font-size: 13px; }
    input { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 7px 10px; font: inherit; min-width: 220px; }
    :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
  `,
})
export class Tooltips {
  protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
  protected readonly copied = signal(false);
  protected readonly removed = signal(false);
  protected remove(p: { open: { set(v: boolean): void } }) { p.open.set(false); this.removed.set(true); }
}
