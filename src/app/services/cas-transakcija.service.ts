import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductCass } from '../models/product/productCass';

@Injectable({
  providedIn: 'root',
})
export class CasTransakcijaService {
  constructor(private httpClient: HttpClient) {}

  getOnlineTransakcije(godina: number, kvartal: number, mesec: string) {
    let params = new HttpParams();
    params = params.append('godina', godina);
    params = params.append('kvartal', kvartal);
    params = params.append('mesec', mesec);

    return this.httpClient.get(
      `${environment.apiURL}cas_transakcija/preuzmiOnlineTransakcije`,
      {
        params: params,
      }
    );
  }

  getTransakcijeProdavnice(
    godina: number,
    kvartal: number,
    mesec: string,
    grad: string,
    adresa: string
  ): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('godina', godina);
    params = params.append('kvartal', kvartal);
    params = params.append('mesec', mesec);
    params = params.append('grad', grad);
    params = params.append('adresa', adresa);

    return this.httpClient.get<any[]>(
      `${environment.apiURL}cas_transakcija/preuzmiTransakcijeIzProdavnice`,
      {
        params: params,
      }
    );
  }

  //DORADI OVU FJU, kupljeniProizvodi su nazivi a username je "" ako nema nalog
  addTransakcija(online: boolean, grad: string, adresa: string, kupljeniProizvodi: string, ukupnaCena: number ,username:string) {
    
    const body = {
      online,
      grad,
      adresa,
      kupljeniProizvodi,
      ukupnaCena,
      usernameKorisnika:username
    }
    
    return this.httpClient.post(`${environment.apiURL}cas_transakcija/dodajTransakciju`, body);
  }

  deleteransakcijeProdavnice(
    godina: number,
    kvartal: number,
    mesec: string,
    grad: string,
    adresa: string
  ) {
    let params = new HttpParams();
    params = params.append('godina', godina);
    params = params.append('kvartal', kvartal);
    params = params.append('mesec', mesec);
    params = params.append('grad', grad);
    params = params.append('adresa', adresa);

    return this.httpClient.delete(
      `${environment.apiURL}cas_transakcija/obrisiTransakcijeProdavnice`,
      {
        params: params,
      }
    );
  }
}
