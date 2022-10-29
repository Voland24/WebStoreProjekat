
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCass } from 'src/app/models/product/productCass';

@Component({
  selector: 'app-product-thumb',
  templateUrl: './product-thumb.component.html',
  styleUrls: ['./product-thumb.component.scss']
})
export class ProductThumbComponent implements OnInit {

  @Input() product: ProductCass | undefined = undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  showProductDetail(){
    if(this.product){
      this.router.navigate(["product-detail"], {queryParams: {"kategorija":this.product.kategorija, "tip": this.product.tip, "naziv": this.product.naziv}});
    }
  }
}
