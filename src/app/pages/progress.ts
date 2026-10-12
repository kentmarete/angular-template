import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card pad">
      <h2>Basic progress bars</h2>
      @for (b of bars; track b.cls) {
        <div class="bar {{ b.cls }}" role="progressbar" [attr.aria-valuenow]="b.v" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="b.name + ' progress'">
          <i [style.width.%]="b.v"></i>
        </div>
      }
    </section>

    <section class="card pad">
      <h2>With labels</h2>
      @for (b of bars.slice(0, 4); track b.cls) {
        <div class="lbl">
          <div class="top"><span>{{ b.name }}</span><span class="muted">{{ b.v }}%</span></div>
          <div class="bar {{ b.cls }}" role="progressbar" [attr.aria-valuenow]="b.v" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="b.name"><i [style.width.%]="b.v"></i></div>
        </div>
      }
      <div class="bar primary tall" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" aria-label="Inside label"><i style="width: 72%">72%</i></div>
    </section>

    <section class="card pad">
      <h2>Sizes, striped &amp; animated</h2>
      <div class="bar primary thin" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="Thin"><i style="width:60%"></i></div>
      <div class="bar success" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="Default"><i style="width:60%"></i></div>
      <div class="bar warning tall" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="Tall"><i style="width:60%"></i></div>
      <div class="bar primary striped" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Striped"><i style="width:75%"></i></div>
      <div class="bar danger striped moving" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" aria-label="Animated stripes"><i style="width:45%"></i></div>
      <div class="bar primary indeterminate" role="progressbar" aria-label="Loading, progress unknown"><i></i></div>
    </section>

    <section class="card pad">
      <h2>Stacked</h2>
      <div class="bar tall stack" role="img" aria-label="Storage: 40% documents, 25% media, 15% apps, 20% free">
        <i class="primary" style="width:40%">Docs</i><i class="success" style="width:25%">Media</i><i class="warning" style="width:15%"></i>
      </div>
      <div class="legend muted"><span><b class="d primary"></b>Documents 40%</span><span><b class="d success"></b>Media 25%</span><span><b class="d warning"></b>Apps 15%</span><span><b class="d free"></b>Free 20%</span></div>
    </section>

    <section class="card pad">
      <header><h2>Interactive</h2>
        <button class="btn" (click)="upload()" [disabled]="running()">{{ running() ? 'Uploading…' : value() >= 100 ? 'Upload again' : 'Simulate upload' }}</button></header>
      <div class="lbl">
        <div class="top"><span>report-q3.pdf</span><span class="muted">{{ value() }}%</span></div>
        <div class="bar" [class]="value() >= 100 ? 'bar success' : 'bar primary'" role="progressbar" [attr.aria-valuenow]="value()" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress"><i [style.width.%]="value()"></i></div>
      </div>
      <label class="range">Set value manually
        <input type="range" min="0" max="100" [value]="value()" (input)="setValue($any($event.target).value)" /></label>
    </section>

    <section class="card pad">
      <h2>Circular progress</h2>
      <div class="rings">
        @for (r of rings; track r.name) {
          <div class="ring" role="progressbar" [attr.aria-valuenow]="r.v" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="r.name">
            <svg viewBox="0 0 36 36" width="84" height="84">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface-2)" stroke-width="3.2"/>
              <circle cx="18" cy="18" r="15.9" fill="none" [attr.stroke]="r.color" stroke-width="3.2" stroke-linecap="round"
                [attr.stroke-dasharray]="r.v + ' 100'" transform="rotate(-90 18 18)"/>
            </svg>
            <b>{{ r.v }}%</b><small class="muted">{{ r.name }}</small>
          </div>
        }
      </div>
    </section>

    <section class="card pad">
      <h2>Spinners</h2>
      <div class="sub muted">Border</div>
      <div class="row">
        @for (c of colors; track c) { <span class="spin {{ c }}" role="status"><span class="sr">Loading…</span></span> }
      </div>
      <div class="sub muted">Sizes</div>
      <div class="row">
        <span class="spin primary xs" role="status"><span class="sr">Loading…</span></span>
        <span class="spin primary sm" role="status"><span class="sr">Loading…</span></span>
        <span class="spin primary" role="status"><span class="sr">Loading…</span></span>
        <span class="spin primary lg" role="status"><span class="sr">Loading…</span></span>
        <span class="spin primary xl" role="status"><span class="sr">Loading…</span></span>
      </div>
      <div class="sub muted">Grow &amp; dots</div>
      <div class="row">
        @for (c of colors; track c) { <span class="grow {{ c }}" role="status"><span class="sr">Loading…</span></span> }
        <span class="dots" role="status"><i></i><i></i><i></i><span class="sr">Loading…</span></span>
      </div>
      <div class="sub muted">In buttons &amp; inline</div>
      <div class="row">
        <button class="btn primary" disabled><span class="spin sm light"></span> Loading…</button>
        <button class="btn outline" disabled><span class="spin sm primary"></span> Processing</button>
        <span class="muted inline"><span class="spin sm primary"></span> Fetching latest data…</span>
      </div>
    </section>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 860px; }
    .pad { padding: 20px; display: grid; gap: 14px; }
    header { display: flex; justify-content: space-between; align-items: center; }
    h2 { font-size: 15px; font-weight: 600; } .sub { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }
    .row { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

    .primary { --c: var(--primary); } .success { --c: var(--green); } .warning { --c: var(--amber); } .danger { --c: var(--red); } .info { --c: var(--violet); } .neutral { --c: var(--muted); }
    .bar { height: 10px; background: var(--surface-2); border-radius: 99px; overflow: hidden; display: flex; }
    .bar.thin { height: 4px; } .bar.tall { height: 22px; font-size: 12px; font-weight: 600; }
    .bar > i { display: block; background: var(--c); border-radius: inherit; transition: width .3s ease; color: #fff; text-align: center; font-style: normal; line-height: inherit; overflow: hidden; }
    .bar.tall > i { line-height: 22px; }
    .bar.success > i, .stack .success { color: #04210f; } .bar.warning > i, .stack .warning { color: #1a1204; }
    .bar.stack { border-radius: 8px; } .stack > i { border-radius: 0; background: var(--c); }
    .striped > i { background-image: linear-gradient(45deg, rgb(255 255 255 / .22) 25%, transparent 25% 50%, rgb(255 255 255 / .22) 50% 75%, transparent 75%); background-size: 20px 20px; }
    .moving > i { animation: stripe 1s linear infinite; } @keyframes stripe { to { background-position: 20px 0; } }
    .indeterminate > i { width: 35%; animation: slide 1.4s ease-in-out infinite; } @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
    .lbl { display: grid; gap: 6px; } .top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; }
    .legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; } .d { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background: var(--c); } .d.free { background: var(--surface-2); border: 1px solid var(--border); }
    .range { display: grid; gap: 6px; font-size: 13px; font-weight: 500; } input[type=range] { accent-color: var(--primary); width: 100%; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); display: inline-flex; align-items: center; gap: 8px; }
    .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.outline { background: transparent; } .btn:disabled { opacity: .7; cursor: progress; }

    .rings { display: flex; flex-wrap: wrap; gap: 28px; }
    .ring { position: relative; width: 84px; display: grid; justify-items: center; gap: 6px; }
    .ring svg { grid-area: 1 / 1; } .ring b { grid-area: 1 / 1; align-self: center; font-size: 15px; } .ring small { margin-top: 96px; position: absolute; }
    .rings { padding-bottom: 26px; }

    .spin { display: inline-block; width: 28px; height: 28px; border-radius: 50%; border: 3px solid color-mix(in srgb, var(--c, var(--primary)) 22%, transparent); border-top-color: var(--c, var(--primary)); animation: r .75s linear infinite; flex: none; }
    .spin.xs { width: 14px; height: 14px; border-width: 2px; } .spin.sm { width: 16px; height: 16px; border-width: 2px; } .spin.lg { width: 40px; height: 40px; border-width: 4px; } .spin.xl { width: 56px; height: 56px; border-width: 5px; }
    .spin.light { border-color: rgb(255 255 255 / .35); border-top-color: #fff; }
    @keyframes r { to { transform: rotate(360deg); } }
    .grow { display: inline-block; width: 28px; height: 28px; border-radius: 50%; background: var(--c); animation: g 1s ease-in-out infinite; }
    @keyframes g { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
    .dots { display: inline-flex; gap: 6px; } .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); animation: b 1s ease-in-out infinite; }
    .dots i:nth-child(2) { animation-delay: .15s; } .dots i:nth-child(3) { animation-delay: .3s; } @keyframes b { 0%, 80%, 100% { transform: translateY(0); opacity: .4; } 40% { transform: translateY(-8px); opacity: 1; } }
    .inline { display: inline-flex; align-items: center; gap: 8px; }
    @media (prefers-reduced-motion: reduce) { .spin, .grow, .dots i, .moving > i, .indeterminate > i { animation-duration: 3s; } }
  `,
})
export class Progress implements OnDestroy {
  protected readonly colors = ['primary', 'success', 'warning', 'danger', 'info', 'neutral'];
  protected readonly bars = [
    { name: 'Primary', cls: 'primary', v: 25 }, { name: 'Success', cls: 'success', v: 50 }, { name: 'Warning', cls: 'warning', v: 65 },
    { name: 'Danger', cls: 'danger', v: 80 }, { name: 'Info', cls: 'info', v: 40 }, { name: 'Neutral', cls: 'neutral', v: 90 },
  ];
  protected readonly rings = [
    { name: 'Budget', v: 62, color: 'var(--primary)' }, { name: 'Savings', v: 85, color: 'var(--green)' },
    { name: 'Debt', v: 30, color: 'var(--red)' }, { name: 'Goals', v: 48, color: 'var(--amber)' },
  ];
  protected readonly value = signal(35);
  protected readonly running = signal(false);
  private timer?: ReturnType<typeof setInterval>;

  protected setValue(v: string) { this.value.set(Number(v)); }
  protected upload() {
    clearInterval(this.timer); this.value.set(0); this.running.set(true);
    this.timer = setInterval(() => {
      const next = Math.min(100, this.value() + Math.ceil(Math.random() * 9));
      this.value.set(next);
      if (next >= 100) { clearInterval(this.timer); this.running.set(false); }
    }, 180);
  }
  ngOnDestroy() { clearInterval(this.timer); }
}
