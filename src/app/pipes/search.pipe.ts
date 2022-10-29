import { Pipe, PipeTransform } from '@angular/core';
import { ProductCass } from '../models/product/productCass';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(products: ProductCass[], naziv: string): ProductCass[] {
    if (!products || !naziv) return products;

    return products.filter((product) =>
      product.naziv.toLocaleLowerCase().includes(naziv.toLocaleLowerCase())
    );
  }

}
