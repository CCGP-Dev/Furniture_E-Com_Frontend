import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';

interface BackendProductItem {
  product_id?: number;
  id?: number;
  name?: string;
  description?: string;
  price?: number | string;
  stock?: number;
  inStock?: boolean;
  category?: string;
  material?: string;
  is_active?: boolean;
  isNew?: boolean;
  image?: string | { secure_url?: string } | null;
  image_url?: string;
}

interface CatalogApiResponse {
  status?: boolean;
  data?: BackendProductItem[];
  message?: string;
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1, name: 'Haven Lounge Chair', price: 89500, category: 'Chairs', material: 'Oak',
    image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_av4fxmav4fxmav4f.jpg', isNew: true, inStock: true,
    description: 'A deeply comfortable lounge chair with a sculptural oak frame and soft, naturally textured upholstery.',
    woodType: 'Solid European oak',
    finishes: [
      { name: 'Natural oak', color: '#d9b48a' },
      { name: 'Walnut', color: '#7a4e34' },
      { name: 'Black ash', color: '#232623' },
    ],
    dimensions: { width: 78, depth: 82, height: 76, seatHeight: 42 },
    care: 'Wipe with a soft, dry cloth. Keep away from direct sunlight and moisture. Re-oil the frame once a year.',
  },
  {
    id: 2, name: 'Söder Three Seater', price: 285000, category: 'Sofas', material: 'Fabric',
    image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_fdruzifdruzifdru.jpg', isNew: true, inStock: true,
    description: 'A generous three seater with a solid frame and washable linen-blend covers, made for long evenings.',
    woodType: 'Solid oak frame',
    finishes: [
      { name: 'Stone grey', color: '#b9b8b2' },
      { name: 'Oat', color: '#d8cfbd' },
      { name: 'Forest', color: '#3d5a4a' },
    ],
    dimensions: { width: 215, depth: 95, height: 82, seatHeight: 44 },
    care: 'Vacuum weekly. Covers can be removed and washed at 30°C. Avoid tumble drying.',
  },
  {
    id: 3, name: 'Arden Oak Console', price: 114500, category: 'Storage', material: 'Oak',
    image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782599/Scandinavian_Living_Room_Serenity.png', isNew: true, inStock: false,
    description: 'A low console with two deep drawers and a quiet, honest oak finish. Ideal for media or entryways.',
    woodType: 'Solid oak',
    finishes: [
      { name: 'Natural oak', color: '#d9b48a' },
      { name: 'Smoked oak', color: '#6b5a49' },
    ],
    dimensions: { width: 160, depth: 40, height: 55 },
    care: 'Dust with a dry cloth. Use coasters and wipe spills immediately. Re-oil once a year.',
  },
  {
    id: 4, name: 'Mora Coffee Table', price: 67500, category: 'Tables', material: 'Teak',
    image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782592/Warm_Neutral_Modern_Living_Room.png', isNew: true, inStock: true,
    description: 'A softly rounded coffee table in solid teak, finished by hand to bring out the natural grain.',
    woodType: 'Solid teak',
    images: ['images/mora.jpg', 'images/haven.jpg', 'images/arden.jpg'],
    finishes: [
      { name: 'Natural teak', color: '#c28a55' },
      { name: 'Dark teak', color: '#5b3a26' },
    ],
    dimensions: { width: 90, depth: 90, height: 38 },
    care: 'Wipe with a damp cloth and dry immediately. Teak oil twice a year keeps the colour rich.',
  },
  { id: 5, name: 'Haven Lounge Chair II', price: 92000, category: 'Chairs', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_av4fxmav4fxmav4f.jpg', isNew: false, inStock: true },
  { id: 6, name: 'Söder Two Seater', price: 195000, category: 'Sofas', material: 'Fabric', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_fdruzifdruzifdru.jpg', isNew: false, inStock: true },
  { id: 7, name: 'Arden Sideboard', price: 134500, category: 'Storage', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782599/Scandinavian_Living_Room_Serenity.png', isNew: false, inStock: true },
  { id: 8, name: 'Mora Side Table', price: 38500, category: 'Tables', material: 'Teak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782592/Warm_Neutral_Modern_Living_Room.png', isNew: false, inStock: false },
  { id: 9, name: 'Haven Dining Chair', price: 54500, category: 'Chairs', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_av4fxmav4fxmav4f.jpg', isNew: false, inStock: true },
  { id: 10, name: 'Söder Corner Sofa', price: 345000, category: 'Sofas', material: 'Fabric', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_fdruzifdruzifdru.jpg', isNew: true, inStock: true },
  { id: 11, name: 'Arden Media Unit', price: 158000, category: 'Storage', material: 'Teak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782599/Scandinavian_Living_Room_Serenity.png', isNew: false, inStock: true },
  { id: 12, name: 'Mora Dining Table', price: 215000, category: 'Tables', material: 'Teak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782592/Warm_Neutral_Modern_Living_Room.png', isNew: false, inStock: true },
  { id: 13, name: 'Haven Armchair', price: 76500, category: 'Chairs', material: 'Fabric', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_av4fxmav4fxmav4f.jpg', isNew: false, inStock: true },
  { id: 14, name: 'Söder Daybed', price: 168000, category: 'Sofas', material: 'Fabric', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_fdruzifdruzifdru.jpg', isNew: false, inStock: false },
  { id: 15, name: 'Arden Bookshelf', price: 98500, category: 'Storage', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782599/Scandinavian_Living_Room_Serenity.png', isNew: false, inStock: true },
  { id: 16, name: 'Mora Nesting Tables', price: 72500, category: 'Tables', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782592/Warm_Neutral_Modern_Living_Room.png', isNew: true, inStock: true },
  { id: 17, name: 'Haven Bar Stool', price: 32500, category: 'Chairs', material: 'Teak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_av4fxmav4fxmav4f.jpg', isNew: false, inStock: true },
  { id: 18, name: 'Arden Chest of Drawers', price: 124000, category: 'Storage', material: 'Oak', image: 'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782601/Gemini_Generated_Image_fdruzifdruzifdru.jpg', isNew: false, inStock: true },
];

const DEFAULT_FALLBACK_IMAGE =
  'https://res.cloudinary.com/eym4vi0x/image/upload/v1793782592/Warm_Neutral_Modern_Living_Room.png';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  readonly catalogApiUrl = 'http://127.0.0.1:8000/products';

  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  // ---- API request states ----
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly usingFallbackData = signal(false);

  // ---- Filter state ----
  readonly searchTerm = signal('');
  readonly category = signal('');
  readonly material = signal('');
  readonly price = signal('');
  readonly stock = signal('');
  readonly sort = signal('Featured');

  // ---- Pagination state ----
  readonly pageSize = 8;
  readonly currentPage = signal(1);

  // ---- Filtered + sorted ----
  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.category();
    const material = this.material();
    const price = this.price();
    const stock = this.stock();

    let result = this._products().filter(p => {
      if (term && !p.name.toLowerCase().includes(term)) return false;
      if (category && p.category !== category) return false;
      if (material && p.material !== material) return false;
      if (stock === 'In stock' && !p.inStock) return false;
      if (stock === 'Out of stock' && p.inStock) return false;
      if (price && !this.matchesPrice(p.price, price)) return false;
      return true;
    });

    switch (this.sort()) {
      case 'Price: Low to High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'Name: A to Z':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  });

  // ---- Pagination ----
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize))
  );

  readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.usingFallbackData.set(false);

    this.http.get<CatalogApiResponse | BackendProductItem[]>(this.catalogApiUrl).subscribe({
      next: (response) => {
        const rawItems = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        const mapped = rawItems
          .filter(item => item.is_active !== false)
          .map((item, index) => this.mapApiProduct(item, index));

        this._products.set(mapped);
        this.isLoading.set(false);
      },
      error: () => {
        this._products.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          'We could not reach the Furnova catalog server right now. Please check that the backend API is running or load the showroom sample catalog.'
        );
      },
    });
  }

  useSampleCatalog(): void {
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.usingFallbackData.set(true);
    this._products.set(SAMPLE_PRODUCTS);
  }

  private mapApiProduct(item: BackendProductItem, index: number): Product {
    const resolvedImage =
      typeof item.image === 'string' && item.image
        ? item.image
        : item.image && typeof item.image === 'object' && item.image.secure_url
          ? item.image.secure_url
          : item.image_url || DEFAULT_FALLBACK_IMAGE;

    const resolvedInStock =
      typeof item.inStock === 'boolean'
        ? item.inStock
        : typeof item.stock === 'number'
          ? item.stock > 0
          : true;

    return {
      id: item.product_id ?? item.id ?? index + 1,
      name: item.name?.trim() || 'Untitled Furniture Piece',
      price: Number(item.price) || 0,
      category: item.category?.trim() || 'Furniture',
      material: item.material?.trim() || 'Oak',
      image: resolvedImage,
      isNew: Boolean(item.isNew),
      inStock: resolvedInStock,
      description: item.description,
    };
  }

  goToPage(page: number) {
    const clamped = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Filter helpers ----
  readonly hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.category() || this.material() || this.price() || this.stock())
  );

  clearFilters() {
    this.searchTerm.set('');
    this.category.set('');
    this.material.set('');
    this.price.set('');
    this.stock.set('');
    this.sort.set('Featured');
  }

  private matchesPrice(value: number, range: string): boolean {
    switch (range) {
      case 'Under LKR 50,000': return value < 50000;
      case 'LKR 50,000 – 100,000': return value >= 50000 && value <= 100000;
      case 'LKR 100,000 – 200,000': return value > 100000 && value <= 200000;
      case 'Over LKR 200,000': return value > 200000;
      default: return true;
    }
  }

  getById(id: number): Product | undefined {
    return this._products().find(p => p.id === id) ?? SAMPLE_PRODUCTS.find(p => p.id === id);
  }

  constructor() {
    effect(() => {
      this.searchTerm();
      this.category();
      this.material();
      this.price();
      this.stock();
      this.sort();
      this.currentPage.set(1);
    });
  }
}