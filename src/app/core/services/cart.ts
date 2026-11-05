import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  finish?: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );

  add(product: Product, quantity: number, finish?: string) {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id && i.finish === finish);
      if (existing) {
        return items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...items, { product, quantity, finish }];
    });
  }
}
