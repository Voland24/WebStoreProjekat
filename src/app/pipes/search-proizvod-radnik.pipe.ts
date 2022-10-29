import { Pipe, PipeTransform } from '@angular/core';
import { ProductCartNeo } from '../models/cart/productCartNeo';

@Pipe({
  name: 'searchProizvodRadnik'
})
export class SearchProizvodRadnikPipe implements PipeTransform {

  transform(proizvodi: any[], naziv: string): any[] {
    if (!proizvodi || !naziv) return proizvodi;

    return proizvodi.filter((product) =>
      product.proizvod.naziv.toLocaleLowerCase().includes(naziv.toLocaleLowerCase())
    );
  }

}
