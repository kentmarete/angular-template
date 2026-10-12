import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, viewChild } from '@angular/core';

/** Right-hand slide-over panel. Bind `[(open)]` and project the body content. */
@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open.set(false)' },
  template: `
    <div class="backdrop" [class.show]="open()" (click)="open.set(false)"></div>
    <aside class="panel" [class.show]="open()" role="dialog" aria-modal="true" [attr.aria-label]="heading()" [attr.inert]="open() ? null : ''">
      <header>
        <h2>{{ heading() }}</h2>
        <button #closeBtn class="x" (click)="open.set(false)" aria-label="Close panel">✕</button>
      </header>
      <div class="body"><ng-content /></div>
      <footer><ng-content select="[drawer-footer]" /></footer>
    </aside>
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgb(0 0 0 / .5); opacity: 0; visibility: hidden; transition: opacity .2s, visibility .2s; z-index: 40; }
    .backdrop.show { opacity: 1; visibility: visible; }
    .panel { position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 100vw; z-index: 41; display: flex; flex-direction: column;
      background: var(--surface); border-left: 1px solid var(--border); box-shadow: -8px 0 32px rgb(0 0 0 / .25);
      transform: translateX(100%); visibility: hidden; transition: transform .25s ease, visibility .25s; }
    .panel.show { transform: none; visibility: visible; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    h2 { font-size: 16px; font-weight: 600; }
    .x { width: 30px; height: 30px; border-radius: 6px; border: 0; background: none; color: var(--muted); }
    .x:hover { background: var(--surface-2); color: var(--text); }
    .body { flex: 1; overflow-y: auto; padding: 20px; }
    footer:not(:empty) { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
    @media (prefers-reduced-motion: reduce) { .panel, .backdrop { transition: none; } }
  `,
})
export class Drawer {
  readonly open = model(false);
  readonly heading = input('Panel');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  constructor() { effect(() => { if (this.open()) queueMicrotask(() => this.closeBtn()?.nativeElement.focus()); }); }
}
