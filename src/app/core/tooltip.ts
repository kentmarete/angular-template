import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Side = 'top' | 'right' | 'bottom' | 'left';
let nextId = 0;

/** Tooltip on hover/focus. Rendered in <body> with fixed positioning so cards never clip it.
 *  Usage: <button appTooltip="Save" tooltipPosition="bottom"> */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()', '(focus)': 'show()', '(mouseleave)': 'hide()', '(blur)': 'hide()',
    '(keydown.escape)': 'hide()', '(click)': 'hide()',
  },
})
export class Tooltip {
  readonly text = input.required<string>({ alias: 'appTooltip' });
  readonly position = input<Side>('top', { alias: 'tooltipPosition' });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private tip?: HTMLElement;

  constructor() { inject(DestroyRef).onDestroy(() => this.hide()); }

  protected show() {
    if (this.tip || !this.text()) return;
    const tip = this.doc.createElement('div');
    tip.className = 'app-tooltip'; tip.role = 'tooltip'; tip.id = `tt-${nextId++}`; tip.textContent = this.text();
    this.doc.body.appendChild(tip); this.tip = tip;
    this.host.setAttribute('aria-describedby', tip.id);

    const r = this.host.getBoundingClientRect(); const t = tip.getBoundingClientRect(); const gap = 8;
    let side = this.position();
    // flip if there's no room on the preferred side
    if (side === 'top' && r.top - t.height - gap < 0) side = 'bottom';
    else if (side === 'bottom' && r.bottom + t.height + gap > innerHeight) side = 'top';
    else if (side === 'left' && r.left - t.width - gap < 0) side = 'right';
    else if (side === 'right' && r.right + t.width + gap > innerWidth) side = 'left';

    let x = r.left + r.width / 2 - t.width / 2; let y = r.top + r.height / 2 - t.height / 2;
    if (side === 'top') y = r.top - t.height - gap; if (side === 'bottom') y = r.bottom + gap;
    if (side === 'left') x = r.left - t.width - gap; if (side === 'right') x = r.right + gap;
    x = Math.max(6, Math.min(x, innerWidth - t.width - 6)); y = Math.max(6, Math.min(y, innerHeight - t.height - 6));
    tip.style.left = `${x}px`; tip.style.top = `${y}px`; tip.dataset['side'] = side;
    requestAnimationFrame(() => tip.classList.add('on'));
  }

  protected hide() {
    this.tip?.remove(); this.tip = undefined; this.host.removeAttribute('aria-describedby');
  }
}
