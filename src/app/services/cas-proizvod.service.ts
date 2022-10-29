import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductCass } from '../models/product/productCass';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductCatergory } from '../models/product/productCatergoryDto';

@Injectable({
  providedIn: 'root',
})
export class CasProizvodService {
  constructor(private httpClient: HttpClient) {}

  getKategorijeITipove(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${environment.apiURL}cas_proizvod/vratiKategorijeTipove`
    );
  }

  getCassandraProizvodi(
    kategorija: string,
    tip: string,
    naziv: string,
    proizvodjac: string,
    pretraga: string,
    ascending: number
  ): Observable<ProductCass[]> {
    let params = new HttpParams();
    params = params.append('kategorija', kategorija);
    params = params.append('tip', tip);
    params = params.append('proizvodjac', proizvodjac);
    params = params.append('naziv', naziv);
    params = params.append('ascending', ascending);
    params = params.append('pretraga', pretraga);
    return this.httpClient.get<ProductCass[]>(
      `${environment.apiURL}cas_proizvod`,
      { params: params }
    );
  }

  addCassandraProizvod(product: ProductCass) {
    const body = {
      kategorija: product.kategorija,
      tip: product.tip,
      naziv: product.naziv,
      cena: product.cena,
      ocena: product.ocena,
      proizvodjac: product.proizvodjac,
      opis: product.opis,
      slika: product.slika,
      popust: product.popust,
    };
    return this.httpClient.post(
      `${environment.apiURL}cas_proizvod/dodajUSveTabeleProizvoda`,
      body
    );
  }

  deleteCassandraProizvod(
    product: ProductCass
  ) {
    let params = new HttpParams();
    params = params.append('kategorija', product.kategorija);
    params = params.append('tip', product.tip);
    params = params.append('proizvodjac', product.proizvodjac);
    params = params.append('naziv', product.naziv);
    params = params.append('cena', product.cena);
    params = params.append('ocena', product.ocena);
    params = params.append('popust', product.popust);
    return this.httpClient.delete(
      `${environment.apiURL}cas_proizvod/obrisiIzSvihTabelaProizvoda`,
      { params: params }
    );
  }

  updateCassandraOcenaProizvoda(product: ProductCass, novaOcena: number, username: string) {
    const body = {
      naziv: product.naziv,
      novaOcena,
      proizvodjac: product.proizvodjac,
      username
    };
    console.log(body);
    return this.httpClient.put(
      `${environment.apiURL}cas_proizvod/updateProizvodOcena`,
      body
    );
  }

  updateCassandraPopustProizvoda(product: ProductCass, novPopust: number) {
    const body = {
      kategrija: product.kategorija,
      tip: product.tip,
      proizvodjac: product.proizvodjac,
      cena: product.cena,
      ocena: product.ocena,
      naziv: product.naziv,
      stariPopust: product.popust,
      popust: novPopust,
    };

    return this.httpClient.put(
      `${environment.apiURL}cas_proizvod/updateProizvodPopust`,
      body
    );
  }
}
