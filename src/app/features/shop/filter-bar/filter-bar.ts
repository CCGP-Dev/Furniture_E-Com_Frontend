import { Component, inject, WritableSignal } from '@angular/core';
import { ProductService } from '../../../core/services/product';

@Component({
  selector: 'app-filter-bar',
  imports: [],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  readonly service = inject(ProductService);

  categories = ['Chairs', 'Sofas', 'Tables', 'Storage'];
  materials = ['Oak', 'Teak', 'Fabric'];
  priceRanges = ['Under LKR 50,000', 'LKR 50,000 – 100,000', 'LKR 100,000 – 200,000', 'Over LKR 200,000'];
  availability = ['In stock', 'Out of stock'];
  sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];

  onSearch(event: Event) {
    this.service.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onSelect(target: WritableSignal<string>, event: Event) {
    target.set((event.target as HTMLSelectElement).value);
  }
}
