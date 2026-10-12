import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';

export interface TabItem { id: string; label: string; badge?: number; disabled?: boolean; }

/** Tab / pill switcher. Two-way bind `[(value)]`, render the matching panel yourself. */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list" [class]="shape() + (filled() ? ' filled' : '')" role="tablist" [attr.aria-label]="label()" (keydown)="onKey($event)">
      @for (t of items(); track t.id) {
        <button type="button" role="tab" class="tab" [id]="'tab-' + uid + t.id" [attr.aria-selected]="value() === t.id"
          [attr.aria-controls]="'panel-' + uid + t.id" [attr.tabindex]="value() === t.id ? 0 : -1" [disabled]="t.disabled"
          [class.active]="value() === t.id" (click)="value.set(t.id)">
          {{ t.label }}@if (t.badge != null) { <span class="badge">{{ t.badge }}</span> }
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .list { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
    .tab { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; border: 0; background: none; color: var(--muted); font-weight: 500; padding: 10px 16px; }
    .tab:hover:not(:disabled):not(.active) { color: var(--text); }
    .tab:disabled { opacity: .4; cursor: not-allowed; }
    .tab:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    .badge { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 99px; background: var(--surface-2); color: var(--muted); font-size: 11px; font-weight: 600; display: grid; place-items: center; }
    .active .badge { background: var(--primary); color: #fff; }

    /* tabs (underline) */
    .list.tabs { border-bottom: 1px solid var(--border); gap: 0; }
    .tabs .tab { border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tabs .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
    .tabs.filled .tab { border-radius: 8px 8px 0 0; border-bottom: 0; margin-bottom: 0; }
    .tabs.filled .tab.active { background: var(--primary); color: #fff; }
    .tabs.filled .active .badge { background: rgb(255 255 255 / .25); }

    /* pills */
    .pills .tab { border-radius: 99px; padding: 8px 16px; }
    .pills .tab.active { background: var(--primary-soft); color: var(--primary); }
    .pills.filled .tab.active { background: var(--primary); color: #fff; }
    .pills.filled .active .badge { background: rgb(255 255 255 / .25); }
  `,
})
export class Tabs {
  readonly items = input.required<TabItem[]>();
  readonly value = model.required<string>();
  readonly shape = input<'tabs' | 'pills'>('tabs');
  readonly filled = input(false);
  readonly label = input('Tabs');
  protected readonly uid = `${Math.random().toString(36).slice(2, 7)}-`;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Arrow/Home/End navigation across enabled tabs. */
  protected onKey(e: KeyboardEvent) {
    const ids = this.items().filter(t => !t.disabled).map(t => t.id);
    const i = ids.indexOf(this.value()); let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % ids.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + ids.length) % ids.length;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = ids.length - 1; else return;
    e.preventDefault(); this.value.set(ids[n]);
    queueMicrotask(() => this.el.nativeElement.querySelector<HTMLElement>('.tab.active')?.focus());
  }
}
