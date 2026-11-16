import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { Product } from '../models/product';

const STORAGE_KEY = 'furnova-cart';

const mockProduct: Product = {
  id: 1,
  name: 'Haven Lounge Chair',
  price: 89500,
  category: 'Chairs',
  material: 'Oak',
  image: 'haven.jpg',
  isNew: true,
  inStock: true,
};

describe('CartService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should be created', () => {
    const service = TestBed.inject(CartService);
    expect(service).toBeTruthy();
  });

  it('should add items and merge quantities for the same product and finish', () => {
    const service = TestBed.inject(CartService);

    service.add(mockProduct, 1, 'Natural oak');
    service.add(mockProduct, 2, 'Natural oak');

    expect(service.items()).toEqual([
      { product: mockProduct, quantity: 3, finish: 'Natural oak' },
    ]);
    expect(service.count()).toBe(3);
  });

  it('should treat different finishes as separate line items', () => {
    const service = TestBed.inject(CartService);

    service.add(mockProduct, 1, 'Natural oak');
    service.add(mockProduct, 1, 'Walnut');

    expect(service.items()).toHaveLength(2);
    expect(service.count()).toBe(2);
  });

  it('should update and remove quantities', () => {
    const service = TestBed.inject(CartService);

    service.add(mockProduct, 2, 'Walnut');
    service.setQuantity(1, 5, 'Walnut');
    expect(service.items()[0].quantity).toBe(5);

    service.setQuantity(1, 0, 'Walnut');
    expect(service.items()).toEqual([]);
  });

  it('should persist cart changes to localStorage', () => {
    const service = TestBed.inject(CartService);
    service.add(mockProduct, 2, 'Natural oak');
    TestBed.flushEffects();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toEqual([
      { product: mockProduct, quantity: 2, finish: 'Natural oak' },
    ]);
  });

  it('should restore the saved cart when the service is created', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ product: mockProduct, quantity: 4, finish: 'Walnut' }])
    );

    const service = TestBed.inject(CartService);

    expect(service.items()).toEqual([
      { product: mockProduct, quantity: 4, finish: 'Walnut' },
    ]);
    expect(service.count()).toBe(4);
    expect(service.total()).toBe(358000);
  });

  it('should clear the cart and storage', () => {
    const service = TestBed.inject(CartService);
    service.add(mockProduct, 1);
    TestBed.flushEffects();

    service.clear();
    TestBed.flushEffects();

    expect(service.items()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});
