import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { AProdavniceComponent } from './components/admin/a-prodavnice/a-prodavnice.component';
import { AProizvodiComponent } from './components/admin/a-proizvodi/a-proizvodi.component';
import { ARadniciComponent } from './components/admin/a-radnici/a-radnici.component';
import { CartComponent } from './components/cart/cart.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { TransakcijeComponent } from './components/transakcije/transakcije.component';
import { OrderProductsComponent } from './components/worker/order-products/order-products.component';
import { SellingProductsComponent } from './components/worker/selling-products/selling-products.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'products',
    component: ProductListComponent,
  },
  {
    path: 'product-detail',
    component: ProductDetailComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'transakcije',
    component: TransakcijeComponent,
    canActivate: [AuthGuard],
    data: {
      role: ['A', 'R', 'K']
    }
  },
  {
    path: 'selling-products',
    component: SellingProductsComponent,
    canActivate: [AuthGuard],
    data: {
      role:["R"]
    }
  },
  {
    path: 'order-products',
    component: OrderProductsComponent,
    canActivate: [AuthGuard],
    data: {
      role:["R"]
    }
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
    data: {
      role:["K"],
    }
  },
  {
    path: 'a-prodavnice',
    component: AProdavniceComponent,
    canActivate: [AuthGuard],
    data: {
      role:["A"]
    }
  },
  {
    path: 'a-radnici',
    component: ARadniciComponent,
    canActivate: [AuthGuard],
    data: {
      role:["A"]
    }
  },
  {
    path: 'a-proizvodi',
    component: AProizvodiComponent,
    canActivate: [AuthGuard],
    data: {
      role:["A"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
