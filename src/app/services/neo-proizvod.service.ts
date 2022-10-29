import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductCass } from '../models/product/productCass';
import { ProductNeo } from '../models/product/productNeo';
import { UserKomentar } from '../models/user/userComment';

@Injectable({
  providedIn: 'root',
})
export class NeoProizvodService {
  constructor(private httpClient: HttpClient) {}

  getNeoProizvod(naziv: string): Observable<ProductNeo[]> {
    let params = new HttpParams();
    params = params.append('naziv', naziv);

    return this.httpClient.get<ProductNeo[]>(
      `${environment.apiURL}neo_proizvod/`,
      {
        params: params,
      }
    );
  }

  //ZA STA CE NAM OVO?
  startsWithPretraga() {}

  addNeoProizvod(neoProduct: ProductNeo) {
    const body = {
      brojKupovina: neoProduct.brojKupovina,
      brojOcena: neoProduct.brojOcena,
      cena: neoProduct.cena,
      kategorija: neoProduct.kategorija,
      naziv: neoProduct.naziv,
      opis: neoProduct.opis,
      popust: neoProduct.popust,
      proizvodjac: neoProduct.proizvodjac,
      slika: neoProduct.slika,
      tip: neoProduct.tip,
      zbirOcena: neoProduct.zbirOcena,
    };

    return this.httpClient.post(
      `${environment.apiURL}neo_proizvod/dodajProizvod`,
      body
    );
  }

  deleteNeoProizvod(naziv: string) {
    let params = new HttpParams();
    params = params.append('naziv', naziv);

    return this.httpClient.delete(
      `${environment.apiURL}neo_proizvod/obrisiProizvod`,
      {
        params: params,
      }
    );
  }

  //MOZDA :PRODUCTNEO umesto :PRODUCTDTO, proveri kada dodjes do admina
  //verovatno je svejedno!
  getProdavnice(product: ProductCass) {
    let params = new HttpParams();
    params = params.append('naziv', product.naziv);
    params = params.append('kategorija', product.kategorija);
    params = params.append('tip', product.tip);

    return this.httpClient.get(
      `${environment.apiURL}neo_proizvod/vratiProdavnice`,
      { params: params }
    );
  }

  getKomentariIOceneZaProizvod(naziv: string): Observable<UserKomentar[]> {
    let params = new HttpParams();
    params = params.append('naziv', naziv);

    return this.httpClient.get<UserKomentar[]>(
      `${environment.apiURL}neo_proizvod/vratiOceneIKomentare`,
      {
        params: params,
      }
    );
  }
}
