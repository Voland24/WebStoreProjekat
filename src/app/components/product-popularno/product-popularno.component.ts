import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProductCass } from 'src/app/models/product/productCass';
import { CasPopularnoService } from 'src/app/services/cas-popularno.service';

@Component({
  selector: 'app-product-popularno',
  templateUrl: './product-popularno.component.html',
  styleUrls: ['./product-popularno.component.scss']
})
export class ProductPopularnoComponent implements OnInit, OnDestroy {

  constructor(private casPopularnoService: CasPopularnoService) { }
  
  destroy$: Subject<boolean> = new Subject();
  products: Observable<any> | undefined = undefined;

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  ngOnInit(): void {
    this.loadPopularniProizvodi();
  }

  loadPopularniProizvodi(){
    this.products = this.casPopularnoService.getCassandraPopularni();
  }

}
