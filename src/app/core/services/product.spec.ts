import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle loading and successful API response', () => {
    service.loadProducts();
    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne(service.catalogApiUrl);
    expect(req.request.method).toBe('GET');

    req.flush({
      status: true,
      data: [{ product_id: 101, name: 'Test Oak Chair', price: 45000, stock: 5, category: 'Chairs' }],
    });

    expect(service.isLoading()).toBe(false);
    expect(service.errorMessage()).toBeNull();
    expect(service.products().length).toBe(1);
    expect(service.products()[0].name).toBe('Test Oak Chair');
  });

  it('should handle empty product list from API', () => {
    service.loadProducts();
    const req = httpMock.expectOne(service.catalogApiUrl);
    req.flush({ status: true, data: [] });

    expect(service.isLoading()).toBe(false);
    expect(service.errorMessage()).toBeNull();
    expect(service.products().length).toBe(0);
  });

  it('should handle API request error', () => {
    service.loadProducts();
    const req = httpMock.expectOne(service.catalogApiUrl);
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });

    expect(service.isLoading()).toBe(false);
    expect(service.errorMessage()).toBeTruthy();
    expect(service.products().length).toBe(0);
  });
});