import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface Step { label: string; hint?: string; icon?: string; }

/** Step indicator. `mode="number"` shows 1-2-3 (✓ when done); `mode="icon"` shows an SVG path per step. */
@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol [class.icons]="mode() === 'icon'" aria-label="Progress">
      @for (s of steps(); track s.label; let i = $index) {
        <li [class.done]="i < current()" [class.now]="i === current()" [attr.aria-current]="i === current() ? 'step' : null">
          <button type="button" class="dot" [disabled]="i >= current()" (click)="pick.emit(i)" [attr.aria-label]="s.label + (i < current() ? ' (completed)' : '')">
            @if (i < current()) {
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
            } @else if (mode() === 'icon' && s.icon) {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="s.icon"/></svg>
            } @else { {{ i + 1 }} }
          </button>
          <span class="txt"><strong>{{ s.label }}</strong>@if (s.hint) { <small class="muted">{{ s.hint }}</small> }</span>
        </li>
      }
    </ol>
  `,
  styles: `
    ol { list-style: none; margin: 0; padding: 0; display: flex; }
    li { flex: 1; display: flex; align-items: center; gap: 12px; position: relative; min-width: 0; }
    li:not(:last-child)::after { content: ''; flex: 1; height: 2px; margin: 0 14px; background: var(--border); border-radius: 2px; }
    li.done:not(:last-child)::after { background: var(--primary); }
    .dot { width: 38px; height: 38px; flex: none; border-radius: 50%; display: grid; place-items: center; font-weight: 600; border: 2px solid var(--border); background: var(--surface); color: var(--muted); padding: 0; }
    .now .dot { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
    .done .dot { background: var(--primary); border-color: var(--primary); color: #fff; cursor: pointer; }
    .dot:disabled { cursor: default; }
    .icons .dot { border-radius: 12px; width: 44px; height: 44px; }
    .txt { display: grid; line-height: 1.3; } .txt small { font-size: 12px; }
    li:not(.now):not(.done) .txt strong { color: var(--muted); }
    @media (max-width: 720px) { .txt { display: none; } li { flex: 1; gap: 0; } li:last-child { flex: 0 0 auto; } li:not(:last-child)::after { margin: 0 8px; } }
  `,
})
export class Stepper {
  readonly steps = input.required<Step[]>();
  readonly current = input(0);
  readonly mode = input<'number' | 'icon'>('number');
  readonly pick = output<number>();
}
