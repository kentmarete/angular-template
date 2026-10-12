import { Injectable, computed, signal } from '@angular/core';

export interface Review { name: string; rating: number; text: string; date: string; }
export interface Product {
  id: number; name: string; sku: string; category: Category; price: number; stock: number; rating: number; reviewCount: number;
  color: string; description: string; specs: [string, string][]; reviews: Review[];
}
export type Category = 'Laptops' | 'Phones' | 'Audio' | 'Wearables' | 'Cameras' | 'Accessories';

export const CATEGORY_ICON: Record<Category, string> = {
  Laptops: 'M5 6h14v9H5zM3 18h18',
  Phones: 'M8 3h8v18H8zM11 18h2',
  Audio: 'M4 15v-3a8 8 0 0116 0v3M4 15h3v5H4zM17 15h3v5h-3z',
  Wearables: 'M8 7h8v10H8zM9 7l1-4h4l1 4M9 17l1 4h4l1-4',
  Cameras: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  Accessories: 'M3 8h18v9H3zM7 11h1M11 11h1M15 11h1M8 14h8',
};
export const CATEGORIES = Object.keys(CATEGORY_ICON) as Category[];

const rev = (n: number): Review[] => [
  { name: 'Amina O.', rating: 5, text: 'Exactly what I needed. Build quality is excellent and it arrived quickly.', date: '2026-09-28' },
  { name: 'Brian M.', rating: 4, text: 'Great value for the price. Minor nitpicks but I would buy again.', date: '2026-09-14' },
  { name: 'Chloe W.', rating: n, text: 'Solid product overall. Works as described.', date: '2026-08-30' },
];
const P = (id: number, name: string, category: Category, price: number, stock: number, rating: number, color: string, description: string, specs: [string, string][]): Product => ({
  id, name, sku: `FIN-${String(1000 + id)}`, category, price, stock, rating, reviewCount: 20 + id * 13, color, description, specs, reviews: rev(Math.round(rating)),
});

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products = signal<Product[]>([
    P(1, 'AeroBook Pro 14', 'Laptops', 1499, 24, 4.8, '#1b84ff', 'A thin, fast 14-inch laptop with an all-day battery and a stunning display for work and play.', [['Display', '14" 2.8K OLED'], ['Processor', '8-core, 3.4 GHz'], ['Memory', '16 GB'], ['Storage', '512 GB SSD'], ['Battery', 'Up to 18 hours'], ['Weight', '1.4 kg']]),
    P(2, 'AeroBook Air 13', 'Laptops', 999, 41, 4.6, '#7c5cfc', 'Light, silent and quick. The everyday laptop that disappears into your bag.', [['Display', '13.3" Retina'], ['Processor', '6-core, 3.0 GHz'], ['Memory', '8 GB'], ['Storage', '256 GB SSD'], ['Battery', 'Up to 15 hours'], ['Weight', '1.2 kg']]),
    P(3, 'Nova X Smartphone', 'Phones', 799, 63, 4.7, '#14b8a6', 'Flagship performance with a pro-grade camera system and two-day battery life.', [['Display', '6.5" AMOLED 120Hz'], ['Camera', '50MP + 12MP'], ['Storage', '256 GB'], ['Battery', '5,000 mAh'], ['5G', 'Yes'], ['Weight', '189 g']]),
    P(4, 'Nova Lite', 'Phones', 349, 0, 4.2, '#f59e0b', 'Everything you need in a phone, at a price that makes sense.', [['Display', '6.1" LCD'], ['Camera', '13MP'], ['Storage', '128 GB'], ['Battery', '4,500 mAh'], ['5G', 'No'], ['Weight', '172 g']]),
    P(5, 'PulseBuds ANC', 'Audio', 179, 120, 4.5, '#ec4899', 'True wireless earbuds with adaptive noise cancelling and crystal-clear calls.', [['Driver', '11 mm'], ['ANC', 'Adaptive'], ['Battery', '8h + 24h case'], ['Water rating', 'IPX4'], ['Bluetooth', '5.3']]),
    P(6, 'StudioCans 700', 'Audio', 329, 18, 4.9, '#1b84ff', 'Reference-grade over-ear headphones with deep, balanced sound.', [['Driver', '40 mm'], ['ANC', 'Hybrid'], ['Battery', '40 hours'], ['Weight', '254 g'], ['Bluetooth', '5.3']]),
    P(7, 'Tempo Watch S', 'Wearables', 249, 5, 4.4, '#17a34a', 'Track workouts, sleep and heart rate with a bright always-on display.', [['Display', '1.4" AMOLED'], ['Battery', '7 days'], ['GPS', 'Built-in'], ['Water rating', '5 ATM'], ['Weight', '38 g']]),
    P(8, 'Tempo Band 3', 'Wearables', 69, 210, 4.1, '#e5484d', 'A slim fitness band with the essentials and two weeks of battery.', [['Display', '1.1" AMOLED'], ['Battery', '14 days'], ['GPS', 'Connected'], ['Water rating', '5 ATM'], ['Weight', '22 g']]),
    P(9, 'Lumen M50 Camera', 'Cameras', 1199, 9, 4.8, '#7c5cfc', 'Mirrorless camera with a 24MP sensor, fast autofocus and 4K video.', [['Sensor', '24MP APS-C'], ['Video', '4K 60fps'], ['Autofocus', '425 points'], ['Battery', '440 shots'], ['Weight', '580 g']]),
    P(10, 'Lumen Action Cam', 'Cameras', 299, 37, 4.3, '#14b8a6', 'Tough, waterproof and ready for any adventure.', [['Video', '5K 30fps'], ['Waterproof', '10 m'], ['Stabilisation', 'HyperSmooth'], ['Battery', '120 min'], ['Weight', '154 g']]),
    P(11, 'Keystroke Mech Keyboard', 'Accessories', 129, 76, 4.6, '#f59e0b', 'Hot-swappable mechanical keyboard with a satisfying, quiet typing feel.', [['Switches', 'Linear, hot-swap'], ['Layout', '75%'], ['Connection', 'USB-C / Bluetooth'], ['Backlight', 'RGB'], ['Weight', '780 g']]),
    P(12, 'Glide Wireless Mouse', 'Accessories', 59, 0, 4.4, '#ec4899', 'Ergonomic wireless mouse with silent clicks and a 90-day battery.', [['Sensor', '8,000 DPI'], ['Buttons', '6'], ['Connection', '2.4 GHz / Bluetooth'], ['Battery', '90 days'], ['Weight', '85 g']]),
  ]);

  readonly byId = (id: number) => computed(() => this.products().find(p => p.id === id));
  related(p: Product, n = 4) {
    const all = this.products().filter(x => x.id !== p.id);
    return [...all.filter(x => x.category === p.category), ...all.filter(x => x.category !== p.category)].slice(0, n);
  }
  update(id: number, patch: Partial<Product>) { this.products.update(l => l.map(p => (p.id === id ? { ...p, ...patch } : p))); }
  remove(id: number) { this.products.update(l => l.filter(p => p.id !== id)); }
  stockLabel(p: Product) { return p.stock === 0 ? 'Out of stock' : p.stock < 10 ? 'Low stock' : 'In stock'; }
}
