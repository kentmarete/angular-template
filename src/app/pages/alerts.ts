import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Alert, AlertType } from '../core/alert';

@Component({
  selector: 'app-alerts',
  imports: [Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card pad">
      <h2>Basic alerts</h2>
      <app-alert type="info">A new software update is available. See what's new in version 2.4.</app-alert>
      <app-alert type="success">Your changes have been saved successfully.</app-alert>
      <app-alert type="warning">Your subscription expires in 3 days.</app-alert>
      <app-alert type="danger">We couldn't process your payment. Please check your card details.</app-alert>
    </section>

    <section class="card pad">
      <h2>Alerts with icons</h2>
      <app-alert type="info" [icon]="true">Heads up! You can customise notifications in settings.</app-alert>
      <app-alert type="success" [icon]="true">Transfer completed. Funds arrive within 2 business days.</app-alert>
      <app-alert type="warning" [icon]="true">Your storage is 90% full. Consider upgrading.</app-alert>
      <app-alert type="danger" [icon]="true">Unable to connect to the server. Try again shortly.</app-alert>
    </section>

    <section class="card pad">
      <h2>Solid alerts</h2>
      <app-alert type="info" [icon]="true" [solid]="true">Maintenance is scheduled for Sunday at 02:00 UTC.</app-alert>
      <app-alert type="success" [icon]="true" [solid]="true">Account verified. You now have full access.</app-alert>
      <app-alert type="danger" [icon]="true" [solid]="true">Two-factor authentication has been disabled.</app-alert>
    </section>

    <section class="card pad">
      <header>
        <h2>Dismissible alerts</h2>
        <button class="btn" (click)="restore()" [disabled]="!dismissedCount()">Restore dismissed ({{ dismissedCount() }})</button>
      </header>
      @for (a of dismissible; track a.type + version()) {
        <app-alert [type]="a.type" [icon]="true" [dismissible]="true" (dismissed)="dismissedCount.set(dismissedCount() + 1)">{{ a.text }}</app-alert>
      }
    </section>

    <section class="card pad">
      <h2>With title &amp; actions</h2>
      <app-alert type="warning" heading="Payment overdue" [icon]="true" [dismissible]="true">
        Invoice #204 was due on 1 October. Late fees may apply after 14 days.
        <span alert-actions><a href="#" (click)="$event.preventDefault()">Pay now</a><a href="#" (click)="$event.preventDefault()">View invoice</a></span>
      </app-alert>
      <app-alert type="success" heading="Budget on track" [icon]="true" [dismissible]="true">
        You've spent 62% of your monthly budget with 9 days remaining.
      </app-alert>
      <app-alert type="danger" heading="Suspicious sign-in blocked" [icon]="true" [dismissible]="true">
        Someone tried to sign in from an unrecognised device in Lagos.
        <span alert-actions><a href="#" (click)="$event.preventDefault()">Review activity</a><a href="#" (click)="$event.preventDefault()">Secure account</a></span>
      </app-alert>
    </section>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    .pad { padding: 20px; display: grid; gap: 12px; }
    header { display: flex; justify-content: space-between; align-items: center; }
    h2 { font-size: 15px; font-weight: 600; }
    [alert-actions] { display: flex; gap: 16px; margin-top: 8px; font-weight: 500; font-size: 13px; }
    a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
    .btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); font-size: 13px; }
    .btn:disabled { opacity: .45; cursor: not-allowed; }
  `,
})
export class Alerts {
  protected readonly dismissible: { type: AlertType; text: string }[] = [
    { type: 'info', text: 'Your report is being generated. We\'ll email you when it\'s ready.' },
    { type: 'success', text: 'Profile photo updated.' },
    { type: 'warning', text: 'Your password hasn\'t changed in 12 months.' },
    { type: 'danger', text: 'Failed to sync 3 transactions.' },
  ];
  protected readonly dismissedCount = signal(0);
  protected readonly version = signal(0);
  protected restore() { this.dismissedCount.set(0); this.version.update(v => v + 1); }
}
