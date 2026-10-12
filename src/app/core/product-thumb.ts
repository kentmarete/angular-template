import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CATEGORY_ICON, Product } from './products';

/** Square product image placeholder: tinted tile with the category icon. */
@Component({
  selector: 'app-product-thumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="t" [style.--c]="product().color" [style.width.px]="size()" [style.height.px]="size()" [style.--r]="radius()" [style.--tilt]="tilt() + 'deg'" role="img" [attr.aria-label]="product().name">
      <svg viewBox="0 0 24 24" [attr.width]="size() * 0.5" [attr.height]="size() * 0.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="path()"/></svg>
    </span>
  `,
  styles: `
    :host { display: inline-block; line-height: 0; }
    .t { display: grid; place-items: center; border-radius: var(--r, 10px); color: #fff; background: linear-gradient(calc(135deg + var(--tilt, 0deg)), color-mix(in srgb, var(--c) 92%, #fff), color-mix(in srgb, var(--c) 55%, #000)); }
  `,
})
export class ProductThumb {
  readonly product = input.required<Product>();
  readonly size = input(40);
  readonly tilt = input(0);
  protected readonly path = computed(() => CATEGORY_ICON[this.product().category]);
  protected readonly radius = computed(() => `${Math.round(this.size() * 0.22)}px`);
}
