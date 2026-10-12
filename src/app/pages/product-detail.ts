import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../core/products';
import { ProductThumb } from '../core/product-thumb';
import { TabItem, Tabs } from '../core/tabs';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink, ProductThumb, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="crumbs muted" aria-label="Breadcrumb"><a routerLink="/products">Products</a> / <span>{{ p()?.name ?? 'Not found' }}</span></nav>

    @if (p(); as p) {
      <section class="card top">
        <div class="gallery">
          <div class="main"><app-product-thumb [product]="p" [size]="mainSize" [tilt]="views[view()]" /></div>
          <div class="thumbs" role="group" aria-label="Product views">
            @for (t of views; track $index) {
              <button type="button" [class.on]="view() === $index" (click)="view.set($index)" [attr.aria-label]="'View ' + ($index + 1)" [attr.aria-pressed]="view() === $index">
                <app-product-thumb [product]="p" [size]="64" [tilt]="t" />
              </button>
            }
          </div>
        </div>

        <div class="info">
          <span class="muted cat">{{ p.category }}</span>
          <h1>{{ p.name }}</h1>
          <div class="rate"><span class="star">★</span> <strong>{{ p.rating }}</strong> <span class="muted">· {{ p.reviewCount }} reviews</span></div>
          <div class="price">{{ p.price | currency:'USD':'symbol':'1.0-0' }}</div>
          <p class="muted">{{ p.description }}</p>
          <p><span class="badge" [class.low]="p.stock > 0 && p.stock < 10" [class.out]="p.stock === 0">{{ svc.stockLabel(p) }}</span>
            <span class="muted sku">SKU {{ p.sku }}</span></p>
          <div class="buy">
            <div class="qty" role="group" aria-label="Quantity">
              <button (click)="qty.set(max(1, qty() - 1))" [disabled]="qty() <= 1" aria-label="Decrease">−</button>
              <output>{{ qty() }}</output>
              <button (click)="qty.set(min(p.stock, qty() + 1))" [disabled]="qty() >= p.stock" aria-label="Increase">＋</button>
            </div>
            <button class="btn primary" [disabled]="p.stock === 0" (click)="added.set(true)">{{ p.stock === 0 ? 'Unavailable' : 'Add to cart' }}</button>
          </div>
          @if (added()) { <p class="up" role="status">✓ Added {{ qty() }} × {{ p.name }} to cart (demo)</p> }
        </div>
      </section>

      <section class="card">
        <div class="tabbar"><app-tabs [items]="tabs" [(value)]="tab" label="Product information" /></div>
        <div class="panel" role="tabpanel">
          @switch (tab()) {
            @case ('description') {
              <h2>About this product</h2>
              <p class="muted">{{ p.description }} Designed with everyday reliability in mind, it ships with a 2-year warranty and free returns within 30 days.</p>
              <ul class="bullets"><li>2-year manufacturer warranty</li><li>Free returns within 30 days</li><li>Ships within 1–2 business days</li></ul>
            }
            @case ('specs') {
              <h2>Specifications</h2>
              <dl class="specs">@for (s of p.specs; track s[0]) { <dt>{{ s[0] }}</dt><dd>{{ s[1] }}</dd> }</dl>
            }
            @case ('reviews') {
              <h2>Customer reviews <span class="muted">({{ p.reviewCount }})</span></h2>
              <ul class="reviews">
                @for (r of p.reviews; track r.name) {
                  <li><div class="rh"><strong>{{ r.name }}</strong><span class="star" [attr.aria-label]="r.rating + ' out of 5'">{{ stars(r.rating) }}</span><small class="muted">{{ r.date | date:'mediumDate' }}</small></div>
                    <p class="muted">{{ r.text }}</p></li>
                }
              </ul>
            }
            @case ('related') {
              <h2>Related products</h2>
              <div class="related">
                @for (r of related(); track r.id) {
                  <a class="rcard card" [routerLink]="['/products', r.id]">
                    <app-product-thumb [product]="r" [size]="96" /><strong>{{ r.name }}</strong>
                    <span class="muted">{{ r.price | currency:'USD':'symbol':'1.0-0' }}</span>
                  </a>
                }
              </div>
            }
          }
        </div>
      </section>
    } @else {
      <section class="card empty"><h2>Product not found</h2><p class="muted">It may have been deleted.</p><a class="btn primary" routerLink="/products">Back to products</a></section>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; max-width: 1040px; }
    .crumbs a { color: var(--primary); text-decoration: none; }
    .top { display: grid; grid-template-columns: minmax(280px, 1fr) 1.1fr; gap: 32px; padding: 24px; }
    .gallery { display: grid; gap: 14px; align-content: start; } .main { display: grid; place-items: center; background: var(--surface-2); border-radius: 14px; padding: 24px; }
    .thumbs { display: flex; gap: 10px; flex-wrap: wrap; } .thumbs button { padding: 3px; border: 2px solid transparent; border-radius: 12px; background: none; } .thumbs button.on { border-color: var(--primary); }
    .info { display: grid; gap: 10px; align-content: start; } .cat { text-transform: uppercase; letter-spacing: .06em; font-size: 12px; }
    h1 { font-size: 26px; letter-spacing: -.02em; } .price { font-size: 30px; font-weight: 700; } .star { color: var(--amber); } .sku { margin-left: 10px; font-size: 12px; }
    .badge { padding: 2px 10px; border-radius: 99px; font-size: 12px; background: var(--green-soft); color: var(--green); } .badge.low { background: var(--primary-soft); color: var(--amber); } .badge.out { background: var(--red-soft); color: var(--red); }
    .buy { display: flex; gap: 12px; align-items: center; margin-top: 6px; flex-wrap: wrap; }
    .qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; } .qty button { width: 36px; height: 38px; border: 0; background: var(--surface-2); } .qty button:disabled { opacity: .4; cursor: not-allowed; } .qty output { min-width: 40px; text-align: center; font-weight: 600; }
    .btn { padding: 10px 22px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); text-decoration: none; color: var(--text); display: inline-block; } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn:disabled { opacity: .5; cursor: not-allowed; }
    .tabbar { padding: 8px 20px 0; } .panel { padding: 24px; display: grid; gap: 12px; } h2 { font-size: 16px; font-weight: 600; } h2 .muted { font-weight: 400; }
    .bullets { margin: 0; padding-left: 20px; color: var(--muted); display: grid; gap: 4px; }
    .specs { display: grid; grid-template-columns: 180px 1fr; margin: 0; max-width: 560px; } .specs dt, .specs dd { padding: 10px 0; border-bottom: 1px solid var(--border); margin: 0; } .specs dt { color: var(--muted); }
    .reviews { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; } .rh { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .related { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
    .rcard { padding: 16px; display: grid; gap: 8px; justify-items: start; text-decoration: none; color: inherit; } .rcard:hover { border-color: var(--primary); } .rcard strong { font-size: 14px; }
    .empty { padding: 48px; text-align: center; display: grid; gap: 10px; justify-items: center; }
    @media (max-width: 860px) { .top { grid-template-columns: minmax(0, 1fr); padding: 16px; gap: 20px; } .main { padding: 12px; } .panel { padding: 16px; } }
  `,
})
export class ProductDetail {
  /** Bound from the `:id` route param. */
  readonly id = input<string>();
  protected readonly svc = inject(ProductService);
  protected readonly mainSize = 260;
  protected readonly views = [0, 40, -40, 90];
  protected readonly view = signal(0);
  protected readonly qty = signal(1);
  protected readonly added = signal(false);
  protected readonly tab = signal('description');
  protected readonly tabs: TabItem[] = [{ id: 'description', label: 'Description' }, { id: 'specs', label: 'Specifications' }, { id: 'reviews', label: 'Reviews' }, { id: 'related', label: 'Related products' }];
  protected readonly p = computed(() => this.svc.products().find(x => x.id === Number(this.id())));
  protected readonly related = computed(() => { const p = this.p(); return p ? this.svc.related(p) : []; });
  protected max = Math.max; protected min = Math.min;
  protected stars(n: number) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
}
