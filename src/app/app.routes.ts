import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/shop/shop-page/shop-page').then(m => m.ShopPage),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/shop/product-detail/product-detail').then(m => m.ProductDetail),
  },
  { path: '**', redirectTo: '' },
];
