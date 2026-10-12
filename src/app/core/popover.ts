import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, model, signal } from '@angular/core';
import { Side } from './tooltip';

/** Click-to-open popover. Put the trigger in `[trigger]`, the body as normal content.
 *  Use a template ref (`#p`) for `p.open()` (aria-expanded) and `p.open.set(false)` (close buttons). */
@Component({
  selector: 'app-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'outside($event)', '(document:keydown.escape)': 'open.set(false)' },
  template: `
    <span class="trigger" (click)="open.set(!open())"><ng-content select="[trigger]" /></span>
    @if (open()) {
      <div class="pop" [class]="'pop ' + side()" role="dialog" [attr.aria-label]="heading() || 'Popover'">
        @if (heading()) { <h4>{{ heading() }}</h4> }
        <div class="content"><ng-content /></div>
      </div>
    }
  `,
  styles: `
    :host { position: relative; display: inline-block; }
    .pop { position: absolute; z-index: 30; width: max-content; max-width: 280px; padding: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 30px rgb(0 0 0 / .3); font-size: 13px; }
    .pop { margin-left: var(--dx, 0px); }
    .pop::before { margin-left: calc(var(--dx, 0px) * -1); content: ''; position: absolute; width: 10px; height: 10px; background: var(--surface); border: 1px solid var(--border); transform: rotate(45deg); }
    h4 { margin: 0 0 6px; font-size: 14px; } .content { color: var(--muted); display: grid; gap: 8px; }
    .top { bottom: calc(100% + 10px); left: 50%; translate: -50% 0; } .top::before { bottom: -6px; left: calc(50% - 5px); border-top: 0; border-left: 0; }
    .bottom { top: calc(100% + 10px); left: 50%; translate: -50% 0; } .bottom::before { top: -6px; left: calc(50% - 5px); border-bottom: 0; border-right: 0; }
    .left { right: calc(100% + 10px); top: 50%; translate: 0 -50%; } .left::before { right: -6px; top: calc(50% - 5px); border-bottom: 0; border-left: 0; }
    .right { left: calc(100% + 10px); top: 50%; translate: 0 -50%; } .right::before { left: -6px; top: calc(50% - 5px); border-top: 0; border-right: 0; }
  `,
})
export class Popover {
  readonly open = model(false);
  readonly position = input<Side>('bottom');
  readonly heading = input('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Side actually used: left/right fall back to bottom on narrow screens. */
  protected readonly side = signal<Side>('bottom');

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const want = this.position();
      this.side.set(innerWidth < 640 && (want === 'left' || want === 'right') ? 'bottom' : want);
      // after the popover renders, nudge it back inside the viewport and keep the arrow on the trigger
      setTimeout(() => {
        const pop = this.el.nativeElement.querySelector<HTMLElement>('.pop'); if (!pop) return;
        pop.style.setProperty('--dx', '0px');
        const r = pop.getBoundingClientRect(); const m = 8;
        const dx = r.left < m ? m - r.left : r.right > innerWidth - m ? innerWidth - m - r.right : 0;
        if (dx) pop.style.setProperty('--dx', `${Math.round(dx)}px`);
      }, 30);
    });
  }
  protected outside(e: Event) { if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false); }
}
