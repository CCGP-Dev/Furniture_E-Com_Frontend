import { DecimalPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart';

@Component({
  selector: 'app-cart-drawer',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer {
  readonly cart = inject(CartService);

  constructor() {
    effect(() => {
      document.body.style.overflow = this.cart.isOpen() ? 'hidden' : '';
    });
  }

  lineTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  close() {
    this.cart.close();
  }

  changeQty(item: CartItem, delta: number) {
    this.cart.changeQuantity(item.product.id, delta, item.finish);
  }

  remove(item: CartItem) {
    this.cart.remove(item.product.id, item.finish);
  }
}
