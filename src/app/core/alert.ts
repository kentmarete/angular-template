import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

const ICONS: Record<AlertType, string> = {
  info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z',
  success: 'M8 12.5l3 3 5-6M12 21a9 9 0 100-18 9 9 0 000 18z',
  warning: 'M12 9v4M12 17h.01M10.3 4.3L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z',
  danger: 'M12 8v5M12 16.5h.01M12 21a9 9 0 100-18 9 9 0 000 18z',
};

/** Inline alert. Project the message as content; optional `[alert-actions]` slot for buttons/links. */
@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!closed()) {
      <div class="alert" [class]="type() + (solid() ? ' solid' : '')" [attr.role]="type() === 'danger' || type() === 'warning' ? 'alert' : 'status'">
        @if (icon()) {
          <svg class="ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[type()]"/></svg>
        }
        <div class="msg">
          @if (heading()) { <strong>{{ heading() }}</strong> }
          <div class="text"><ng-content /></div>
          <div class="actions"><ng-content select="[alert-actions]" /></div>
        </div>
        @if (dismissible()) {
          <button type="button" class="x" (click)="close()" aria-label="Dismiss alert">✕</button>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .alert { --c: var(--primary); --bg: var(--primary-soft); display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); background: var(--bg); color: var(--text); }
    .success { --c: var(--green); --bg: var(--green-soft); }
    .warning { --c: var(--amber); --bg: color-mix(in srgb, var(--amber) 14%, var(--surface)); }
    .danger { --c: var(--red); --bg: var(--red-soft); }
    .solid { background: var(--c); border-color: var(--c); color: #fff; }
    .solid.success, .solid.warning { color: #1a1204; } .solid.success .ico, .solid.warning .ico { color: inherit; }
    .ico { flex: none; color: var(--c); margin-top: 1px; } .solid .ico { color: #fff; }
    .msg { flex: 1; min-width: 0; display: grid; gap: 2px; } .text { font-size: 13.5px; opacity: .92; }
    .actions:not(:empty) { display: flex; gap: 14px; margin-top: 8px; font-weight: 500; font-size: 13px; }
    .x { flex: none; border: 0; background: none; color: inherit; opacity: .6; width: 24px; height: 24px; border-radius: 6px; padding: 0; margin: -2px -4px 0 0; }
    .x:hover { opacity: 1; background: color-mix(in srgb, currentColor 12%, transparent); }
  `,
})
export class Alert {
  readonly type = input<AlertType>('info');
  readonly heading = input('');
  readonly icon = input(false);
  readonly dismissible = input(false);
  readonly solid = input(false);
  readonly dismissed = output<void>();
  protected readonly paths = ICONS;
  protected readonly closed = signal(false);
  protected close() { this.closed.set(true); this.dismissed.emit(); }
}
