import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AboutComponent } from './components/about/about.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { commonReducer } from './store/common/common.reducer';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductThumbComponent } from './components/product-thumb/product-thumb.component';

import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalModule } from './components/_modal';
import { SearchPipe } from './pipes/search.pipe';
import { ToastrModule } from 'ngx-toastr';
import { TransakcijeComponent } from './components/transakcije/transakcije.component';
import { OrderProductsComponent } from './components/worker/order-products/order-products.component';
import { SellingProductsComponent } from './components/worker/selling-products/selling-products.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CartComponent } from './components/cart/cart.component';
import { AProizvodiComponent } from './components/admin/a-proizvodi/a-proizvodi.component';
import { ARadniciComponent } from './components/admin/a-radnici/a-radnici.component';
import { AProdavniceComponent } from './components/admin/a-prodavnice/a-prodavnice.component';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { ProductPopularnoComponent } from './components/product-popularno/product-popularno.component';
import { ProductPreporukeComponent } from './components/product-preporuke/product-preporuke.component';
import { SearchProizvodRadnikPipe } from './pipes/search-proizvod-radnik.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    ProductListComponent,
    AboutComponent,
    ProductDetailComponent,
    ProductThumbComponent,
    SearchPipe,
    TransakcijeComponent,
    OrderProductsComponent,
    SellingProductsComponent,
    CartComponent,
    AProizvodiComponent,
    ARadniciComponent,
    AProdavniceComponent,
    ProductPopularnoComponent,
    ProductPreporukeComponent,
    SearchProizvodRadnikPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ModalModule,
    ScrollingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    MatRadioModule,
    StoreModule.forRoot(
      {
        common: commonReducer,
      },
      {
        metaReducers: !environment.production ? [] : [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
