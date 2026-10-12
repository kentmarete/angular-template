import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TabItem, Tabs } from '../core/tabs';

const COPY: Record<string, { title: string; body: string }> = {
  overview: { title: 'Overview', body: 'A summary of your account activity, balances and recent changes at a glance.' },
  activity: { title: 'Activity', body: 'Every transaction, login and settings change, newest first. Filter by type or date.' },
  reports: { title: 'Reports', body: 'Monthly and quarterly statements you can download as PDF or CSV.' },
  settings: { title: 'Settings', body: 'Manage notifications, connected accounts and security preferences.' },
};

@Component({
  selector: 'app-tabs-pills',
  imports: [Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (d of demos; track d.title) {
      <section class="card">
        <header><h2>{{ d.title }}</h2><p class="muted">{{ d.note }}</p></header>
        <div class="bar"><app-tabs [items]="items" [(value)]="d.state" [shape]="d.shape" [filled]="d.filled" [label]="d.title" /></div>
        <div class="panel" role="tabpanel" [attr.aria-label]="copy[d.state()].title">
          <h3>{{ copy[d.state()].title }}</h3><p class="muted">{{ copy[d.state()].body }}</p>
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    header { padding: 20px 20px 12px; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
    h2 { font-size: 15px; font-weight: 600; } h3 { font-size: 15px; margin-bottom: 4px; }
    .bar { padding: 0 20px; } .panel { padding: 20px; }
  `,
})
export class TabsPills {
  protected readonly copy = COPY;
  protected readonly items: TabItem[] = [
    { id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity', badge: 12 },
    { id: 'reports', label: 'Reports' }, { id: 'settings', label: 'Settings', disabled: false },
  ];
  protected readonly demos = [
    { title: 'Basic tabs', note: 'Underline indicator', shape: 'tabs' as const, filled: false, state: signal('overview') },
    { title: 'Filled tabs', note: 'Solid active tab', shape: 'tabs' as const, filled: true, state: signal('overview') },
    { title: 'Basic pills', note: 'Soft highlighted pill', shape: 'pills' as const, filled: false, state: signal('overview') },
    { title: 'Filled pills', note: 'Solid active pill', shape: 'pills' as const, filled: true, state: signal('overview') },
  ];
}
