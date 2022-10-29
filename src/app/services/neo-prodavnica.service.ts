import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Prodavnica } from '../models/prodavnica';
import { ProductCass } from '../models/product/productCass';

@Injectable({
  providedIn: 'root',
})
export class NeoProdavnicaService {
  constructor(private httpClient: HttpClient) {}

  getAllProdavnice(): Observable<Prodavnica[]> {
    return this.httpClient.get<Prodavnica[]>(
      `${environment.apiURL}neo_prodavnica/preuzmiProdavnice`
    );
  }

  getProdavniceUGradu(grad: string): Observable<Prodavnica[]> {
    let params = new HttpParams();
    params = params.append('grad', grad);
    return this.httpClient.get<Prodavnica[]>(
      `${environment.apiURL}neo_prodavnica/preuzmiProdavniceUGradu`,
      { params: params }
    );
  }

  addProdavnica(prodavnica: Prodavnica) {
    const body = {
      grad: prodavnica.grad,
      adresa: prodavnica.adresa,
      radnoVreme: prodavnica.radnoVreme,
      telefon: prodavnica.telefon,
      email: prodavnica.email,
    };
    return this.httpClient.post(
      `${environment.apiURL}neo_prodavnica/dodajProdavnicu`,
      body
    );
  }

  updateProdavnica(prodavnica: Prodavnica) {
    const body = {
      grad: prodavnica.grad,
      adresa: prodavnica.adresa,
      radnoVreme: prodavnica.radnoVreme,
      telefon: prodavnica.telefon,
      email: prodavnica.email,
    };
    return this.httpClient.put(
      `${environment.apiURL}neo_prodavnica/izmeniProdavnicu`,
      body
    );
  }

  deleteProdavnica(prodavnica: Prodavnica) {
    let params = new HttpParams();
    params = params.append('grad', prodavnica.grad);
    params = params.append('adresa', prodavnica.adresa);
    return this.httpClient.delete<Prodavnica[]>(
      `${environment.apiURL}neo_prodavnica/obrisiProdavnicu`,
      { params: params }
    );
  }

  getStanjeMagacina(product: ProductCass, prodavnica: Prodavnica) {
    let params = new HttpParams();
    params = params.append('grad', prodavnica.grad);
    params = params.append('adresa', prodavnica.adresa);
    params = params.append('naziv', product.naziv);

    return this.httpClient.get(
      `${environment.apiURL}neo_prodavnica/vratiStanjeMagacina`,
      { params: params }
    );
  }

  getSveProizvodeProdavnice(prodavnica: Prodavnica): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('grad', prodavnica.grad);
    params = params.append('adresa', prodavnica.adresa);

    return this.httpClient.get<any[]>(
      `${environment.apiURL}neo_prodavnica/vratiSveProizvodeProdavnice`,
      { params: params }
    );
  }

  deleteMagacin(product: ProductCass, prodavnica: Prodavnica) {
    let params = new HttpParams();
    params = params.append('grad', prodavnica.grad);
    params = params.append('adresa', prodavnica.adresa);
    params = params.append('kategorija', product.kategorija);
    params = params.append('tip', product.tip);
    params = params.append('naziv', product.naziv);

    return this.httpClient.delete<Prodavnica[]>(
      `${environment.apiURL}neo_prodavnica/obrisiMagacin`,
      { params: params }
    );
  }

  naruciProizvod(
    product: ProductCass,
    prodavnica: Prodavnica,
    brojProizvoda: number
  ) {
    const body = {
      naziv: product.naziv,
      grad: prodavnica.grad,
      adresa: prodavnica.adresa,
      brojProizvoda,
    };

    return this.httpClient.post(
      `${environment.apiURL}neo_prodavnica/naruciProizvod`,
      body,
      { responseType: 'text' }
    );
  }

  dektementirajBrojProizvodaMagacina(
    grad: string,
    adresa: string,
    nizNaziva: string[],
    nizBrojaProizvoda: number[]
  ) {
    const body = {
      grad,
      adresa,
      nizNaziva,
      nizBrojaProizvoda,
    };

    return this.httpClient.put(
      `${environment.apiURL}neo_prodavnica/dekrementirajBrojProizvodaMagacina`,
      body,
      { responseType: 'text' }
    );
  }
}
