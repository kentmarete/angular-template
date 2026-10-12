import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIES, Product, ProductService } from '../core/products';
import { ProductThumb } from '../core/product-thumb';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, FormsModule, RouterLink, ProductThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'menu.set(null)', '(document:keydown.escape)': 'closeAll()' },
  template: `
    <div class="card">
      <header>
        <div><h2>Products</h2><p class="muted">{{ rows().length }} of {{ svc.products().length }} products</p></div>
        <div class="tools">
          <input type="search" placeholder="Search products…" aria-label="Search products" (input)="query.set($any($event.target).value)" />
          <select aria-label="Category" (change)="cat.set($any($event.target).value)">
            <option value="">All categories</option>
            @for (c of categories; track c) { <option>{{ c }}</option> }
          </select>
        </div>
      </header>
      <div class="scroll">
        <table>
          <thead><tr><th>Product</th><th class="hide-sm">Category</th><th class="r">Price</th><th>Stock</th><th class="hide-sm">Rating</th><th class="act"><span class="sr">Actions</span></th></tr></thead>
          <tbody>
            @for (p of rows(); track p.id) {
              <tr>
                <td>
                  <a class="prod" [routerLink]="['/products', p.id]">
                    <app-product-thumb [product]="p" [size]="40" />
                    <span><strong>{{ p.name }}</strong><br><small class="muted">{{ p.sku }}</small></span>
                  </a>
                </td>
                <td class="hide-sm">{{ p.category }}</td>
                <td class="r">{{ p.price | currency:'USD':'symbol':'1.0-0' }}</td>
                <td><span class="badge" [class.low]="p.stock > 0 && p.stock < 10" [class.out]="p.stock === 0">{{ svc.stockLabel(p) }}@if (p.stock) { · {{ p.stock }} }</span></td>
                <td class="hide-sm"><span class="star">★</span> {{ p.rating }} <small class="muted">({{ p.reviewCount }})</small></td>
                <td class="act">
                  <div class="kebab" (click)="$event.stopPropagation()">
                    <button class="dots" (click)="menu.set(menu() === p.id ? null : p.id)" aria-haspopup="menu" [attr.aria-expanded]="menu() === p.id" [attr.aria-label]="'Actions for ' + p.name">⋯</button>
                    @if (menu() === p.id) {
                      <div class="pop" role="menu">
                        <a role="menuitem" [routerLink]="['/products', p.id]">View</a>
                        <button role="menuitem" (click)="startEdit(p)">Edit</button>
                        <button role="menuitem" class="danger" (click)="deleting.set(p); menu.set(null)">Delete</button>
                      </div>
                    }
                  </div>
                </td>
              </tr>
            } @empty { <tr><td colspan="6" class="muted empty">No products match your filters.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>

    @if (editing(); as e) {
      <div class="overlay" (click)="editing.set(null)">
        <form class="modal card" role="dialog" aria-modal="true" aria-label="Edit product" (click)="$event.stopPropagation()" (ngSubmit)="saveEdit()">
          <h3>Edit product</h3>
          <label>Name<input name="name" [(ngModel)]="e.name" required /></label>
          <div class="two">
            <label>Price (USD)<input name="price" type="number" min="0" [(ngModel)]="e.price" required /></label>
            <label>Stock<input name="stock" type="number" min="0" [(ngModel)]="e.stock" required /></label>
          </div>
          <div class="foot"><button type="button" class="btn" (click)="editing.set(null)">Cancel</button><button class="btn primary">Save</button></div>
        </form>
      </div>
    }
    @if (deleting(); as d) {
      <div class="overlay" (click)="deleting.set(null)">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-label="Confirm delete" (click)="$event.stopPropagation()">
          <h3>Delete product?</h3><p class="muted">{{ d.name }} will be removed from the catalogue.</p>
          <div class="foot"><button class="btn" (click)="deleting.set(null)">Cancel</button><button class="btn del" (click)="confirmDelete()">Delete</button></div>
        </div>
      </div>
    }
  `,
  styles: `
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; flex-wrap: wrap; }
    h2 { font-size: 16px; font-weight: 600; } h3 { font-size: 16px; }
    .tools { display: flex; gap: 10px; flex-wrap: wrap; }
    input, select { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 8px 12px; font: inherit; outline: none; max-width: 100%; }
    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    .scroll { overflow-x: auto; position: relative; } table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 10px 20px; border-block: 1px solid var(--border); background: var(--surface-2); white-space: nowrap; }
    td { padding: 12px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; } tbody tr:last-child td { border-bottom: 0; } tbody tr:hover { background: var(--surface-2); }
    .r { text-align: right; font-variant-numeric: tabular-nums; } .act { width: 1%; text-align: right; } .empty { text-align: center; padding: 32px; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .prod { display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; } .prod:hover strong { color: var(--primary); }
    .badge { padding: 2px 10px; border-radius: 99px; font-size: 12px; background: var(--green-soft); color: var(--green); white-space: nowrap; }
    .badge.low { background: var(--primary-soft); color: var(--amber); } .badge.out { background: var(--red-soft); color: var(--red); } .star { color: var(--amber); }
    .dots { width: 30px; height: 30px; border-radius: 6px; border: 0; background: none; color: var(--muted); font-size: 18px; line-height: 1; }
    .dots:hover, .dots[aria-expanded=true] { background: var(--surface-2); color: var(--text); }
    .kebab { position: relative; display: inline-block; }
    .pop { position: absolute; right: 0; top: calc(100% + 4px); z-index: 10; min-width: 130px; padding: 4px; display: grid; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 8px 24px rgb(0 0 0 / .25); text-align: left; }
    .pop a, .pop button { text-align: left; padding: 8px 10px; border: 0; background: none; border-radius: 6px; color: var(--text); text-decoration: none; } .pop a:hover, .pop button:hover { background: var(--surface-2); } .danger { color: var(--red) !important; }
    .overlay { position: fixed; inset: 0; background: rgb(0 0 0 / .55); display: grid; place-items: center; z-index: 50; padding: 16px; }
    .modal { width: 100%; max-width: 420px; padding: 24px; display: grid; gap: 14px; } .modal label { display: grid; gap: 6px; font-size: 13px; font-weight: 500; } .modal input { width: 100%; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; } .foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
    .btn { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); } .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; } .btn.del { background: var(--red); border-color: var(--red); color: #fff; }
  `,
})
export class Products {
  protected readonly svc = inject(ProductService);
  protected readonly categories = CATEGORIES;
  protected readonly query = signal(''); protected readonly cat = signal('');
  protected readonly menu = signal<number | null>(null);
  protected readonly editing = signal<Product | null>(null);
  protected readonly deleting = signal<Product | null>(null);
  protected readonly rows = computed(() => {
    const q = this.query().toLowerCase();
    return this.svc.products().filter(p => (!this.cat() || p.category === this.cat()) && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
  });
  protected startEdit(p: Product) { this.editing.set({ ...p }); this.menu.set(null); }
  protected saveEdit() {
    const e = this.editing(); if (!e?.name.trim()) return;
    this.svc.update(e.id, { name: e.name.trim(), price: Number(e.price) || 0, stock: Math.max(0, Number(e.stock) || 0) }); this.editing.set(null);
  }
  protected confirmDelete() { const d = this.deleting(); if (d) this.svc.remove(d.id); this.deleting.set(null); }
  protected closeAll() { this.menu.set(null); this.editing.set(null); this.deleting.set(null); }
}
