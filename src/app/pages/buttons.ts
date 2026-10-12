import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Tone { name: string; cls: string; }

const PATHS = {
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
};

@Component({
  selector: 'app-buttons',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card pad">
      <h2>Basic buttons</h2>
      <div class="row">@for (t of tones; track t.cls) { <button class="btn {{ t.cls }}">{{ t.name }}</button> }</div>
    </section>

    <section class="card pad">
      <h2>Outlined buttons</h2>
      <div class="row">@for (t of tones; track t.cls) { <button class="btn outline {{ t.cls }}">{{ t.name }}</button> }</div>
    </section>

    <section class="card pad">
      <h2>Label buttons <span class="muted">soft tinted background</span></h2>
      <div class="row">@for (t of tones; track t.cls) { <button class="btn label {{ t.cls }}">{{ t.name }}</button> }</div>
    </section>

    <section class="card pad">
      <h2>Buttons with icons</h2>
      <div class="sub muted">Icon left</div>
      <div class="row">
        <button class="btn primary"><ng-container *ngTemplateOutlet="ico; context: { p: p.plus }" /> Add new</button>
        <button class="btn success"><ng-container *ngTemplateOutlet="ico; context: { p: p.check }" /> Approve</button>
        <button class="btn danger"><ng-container *ngTemplateOutlet="ico; context: { p: p.trash }" /> Delete</button>
        <button class="btn outline primary"><ng-container *ngTemplateOutlet="ico; context: { p: p.download }" /> Download</button>
        <button class="btn label warning"><ng-container *ngTemplateOutlet="ico; context: { p: p.mail }" /> Message</button>
      </div>
      <div class="sub muted">Icon right</div>
      <div class="row">
        <button class="btn primary">Continue <ng-container *ngTemplateOutlet="ico; context: { p: p.arrow }" /></button>
        <button class="btn outline success">Next step <ng-container *ngTemplateOutlet="ico; context: { p: p.arrow }" /></button>
        <button class="btn label primary">Open <ng-container *ngTemplateOutlet="ico; context: { p: p.arrow }" /></button>
      </div>
      <div class="sub muted">Icon only</div>
      <div class="row">
        <button class="btn primary icon" aria-label="Add"><ng-container *ngTemplateOutlet="ico; context: { p: p.plus }" /></button>
        <button class="btn outline danger icon" aria-label="Delete"><ng-container *ngTemplateOutlet="ico; context: { p: p.trash }" /></button>
        <button class="btn label danger icon" aria-label="Favourite"><ng-container *ngTemplateOutlet="ico; context: { p: p.heart }" /></button>
        <button class="btn neutral icon" aria-label="Settings"><ng-container *ngTemplateOutlet="ico; context: { p: p.gear }" /></button>
        <button class="btn primary icon round" aria-label="Add"><ng-container *ngTemplateOutlet="ico; context: { p: p.plus }" /></button>
        <button class="btn label success icon round" aria-label="Approve"><ng-container *ngTemplateOutlet="ico; context: { p: p.check }" /></button>
      </div>
      <div class="sub muted">Loading</div>
      <div class="row">
        <button class="btn primary" [disabled]="loading()" (click)="load()">
          @if (loading()) { <span class="spin"></span> Saving… } @else { <ng-container *ngTemplateOutlet="ico; context: { p: p.check }" /> Save changes }
        </button>
      </div>
    </section>

    <section class="card pad">
      <h2>Sizes &amp; states</h2>
      <div class="row">
        <button class="btn primary sm">Small</button><button class="btn primary">Default</button><button class="btn primary lg">Large</button>
        <button class="btn primary" disabled>Disabled</button><button class="btn outline primary" disabled>Disabled</button><button class="btn label primary" disabled>Disabled</button>
        <button class="btn primary block">Block button</button>
      </div>
    </section>

    <ng-template #ico let-p="p">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="p" /></svg>
    </ng-template>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    .pad { padding: 20px; display: grid; gap: 14px; }
    h2 { font-size: 15px; font-weight: 600; } h2 .muted { font-weight: 400; font-size: 13px; margin-left: 8px; }
    .sub { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }
    .row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

    .btn { --c: var(--primary); --on: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 18px; border-radius: 8px; border: 1px solid var(--c);
      background: var(--c); color: var(--on); font-weight: 500; transition: filter .12s, background .12s; }
    .btn:hover:not(:disabled) { filter: brightness(1.1); }
    .btn:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .success { --c: var(--green); --on: #04210f; } .danger { --c: var(--red); }
    .warning { --c: var(--amber); --on: #1a1204; } .info { --c: var(--violet); }
    .neutral { --c: var(--muted); --on: var(--bg); }

    .outline { background: transparent; color: var(--c); }
    .outline:hover:not(:disabled) { background: color-mix(in srgb, var(--c) 12%, transparent); filter: none; }
    .label { background: color-mix(in srgb, var(--c) 16%, transparent); border-color: transparent; color: var(--c); }
    .label:hover:not(:disabled) { background: var(--c); color: var(--on); filter: none; }
    .neutral.outline, .neutral.label { color: var(--text); --c: var(--muted); }

    .sm { padding: 5px 12px; font-size: 13px; } .lg { padding: 12px 26px; font-size: 16px; } .block { width: 100%; }
    .icon { width: 38px; height: 38px; padding: 0; } .round { border-radius: 50%; }
    .spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgb(255 255 255 / .4); border-top-color: #fff; animation: r .7s linear infinite; }
    @keyframes r { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spin { animation-duration: 2s; } }
  `,
})
export class Buttons {
  protected readonly p = PATHS;
  protected readonly loading = signal(false);
  protected readonly tones: Tone[] = [
    { name: 'Primary', cls: 'primary' }, { name: 'Success', cls: 'success' }, { name: 'Warning', cls: 'warning' },
    { name: 'Danger', cls: 'danger' }, { name: 'Info', cls: 'info' }, { name: 'Neutral', cls: 'neutral' },
  ];
  protected load() { this.loading.set(true); setTimeout(() => this.loading.set(false), 1800); }
}
