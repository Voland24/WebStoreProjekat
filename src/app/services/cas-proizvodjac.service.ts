import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proizvodjac } from '../models/product/proizvodjac';

@Injectable({
  providedIn: 'root'
})
export class CasProizvodjacService {

  constructor(private httpClient: HttpClient) { }

  getAllProizvodjaci(kategorija: string, tip: string): Observable<Proizvodjac[]>{
    let params = new HttpParams();
    params = params.append("kategorija", kategorija);
    params = params.append("tip", tip);
    return this.httpClient.get<Proizvodjac[]>(`${environment.apiURL}cas_proizvodjac/preuzmiProizvodjace`, {params: params});
  }


  //QUESTION: NAZIV verovatno naziv proizvodjaca?
  getSpecificProizvodjac(kategorija: string, tip: string, naziv:string){
    let params = new HttpParams();
    params = params.append("kategorija", kategorija);
    params = params.append("tip", tip);
    params = params.append("naziv", naziv);
    return this.httpClient.get<Proizvodjac>(`${environment.apiURL}cas_proizvodjac/preuzmiProizvodjaca`, {params: params});
  }

  addProizvodjac(kategorija: string, tip: string, naziv:string){
    const body = {
      kategorija,
      tip,
      naziv
    }
    return this.httpClient.post(`${environment.apiURL}cas_proizvodjac/dodajProizvodjaca`, body);
  }

  deleteProizvodjac(kategorija: string, tip: string, naziv:string){
    let params = new HttpParams();
    params = params.append("kategorija", kategorija);
    params = params.append("tip", tip);
    params = params.append("naziv", naziv);
    return this.httpClient.delete(`${environment.apiURL}cas_proizvodjac/obrisiProizvodjaca`, {params: params});
  }
}
