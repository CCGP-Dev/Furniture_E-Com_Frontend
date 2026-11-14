import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/cart';
import { Finish, Product } from '../../../core/models/product';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DecimalPipe, ProductCard],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  readonly service = inject(ProductService);
  private readonly cart = inject(CartService);

  id = input.required<string>();

  product = computed(() => this.service.getById(Number(this.id())));

  selectedFinish = linkedSignal<Product | undefined, Finish | undefined>({
    source: this.product,
    computation: p => p?.finishes?.[0],
  });
  quantity = linkedSignal({ source: this.product, computation: () => 1 });

  added = signal(false);

  related = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.service
      .products()
      .filter(x => x.id !== p.id && x.category !== p.category)
      .slice(0, 3);
  });

  openSection = linkedSignal<Product | undefined, string | null>({
    source: this.product,
    computation: () => 'dimensions',
  });

  toggleSection(key: string) {
    this.openSection.update(current => (current === key ? null : key));
  }

  changeQty(delta: number) {
    this.quantity.update(q => Math.min(10, Math.max(1, q + delta)));
  }

  addToCart(p: Product) {
    this.cart.add(p, this.quantity(), this.selectedFinish()?.name);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1800);
  }
}
