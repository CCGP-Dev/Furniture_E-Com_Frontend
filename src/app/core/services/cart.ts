import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  finish?: string;
  quantity: number;
}

const STORAGE_KEY = 'furnova-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());
  private readonly _isOpen = signal(false);

  readonly items = this._items.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  constructor() {
    effect(() => {
      this.saveToStorage(this._items());
    });
  }

  open() {
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
  }

  toggle() {
    this._isOpen.update(open => !open);
  }

  add(product: Product, quantity: number, finish?: string) {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id && i.finish === finish);
      if (existing) {
        return items.map(i =>
          i === existing
            ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
            : i
        );
      }
      return [...items, { product, quantity: Math.min(10, quantity), finish }];
    });
  }

  setQuantity(productId: number, quantity: number, finish?: string) {
    if (quantity <= 0) {
      this.remove(productId, finish);
      return;
    }

    const next = Math.min(10, quantity);
    this._items.update(items =>
      items.map(i =>
        i.product.id === productId && i.finish === finish
          ? { ...i, quantity: next }
          : i
      )
    );
  }

  changeQuantity(productId: number, delta: number, finish?: string) {
    const item = this._items().find(
      i => i.product.id === productId && i.finish === finish
    );
    if (!item) return;
    this.setQuantity(productId, item.quantity + delta, finish);
  }

  remove(productId: number, finish?: string) {
    this._items.update(items =>
      items.filter(i => !(i.product.id === productId && i.finish === finish))
    );
  }

  clear() {
    this._items.set([]);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        item =>
          item &&
          typeof item.quantity === 'number' &&
          item.quantity > 0 &&
          item.product &&
          typeof item.product.id === 'number'
      );
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota / private-mode write failures.
    }
  }
}
