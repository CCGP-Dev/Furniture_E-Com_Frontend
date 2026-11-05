import { Component, inject } from '@angular/core';
import { ProductService } from '../../../core/services/product';
import { ProductCard } from '../../../shared/product-card/product-card';
import { FilterBar } from '../filter-bar/filter-bar';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-shop-page',
  imports: [FilterBar, ProductCard, Pagination],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
})
export class ShopPage {
  readonly service = inject(ProductService);
  products = this.service.pagedProducts;
}
