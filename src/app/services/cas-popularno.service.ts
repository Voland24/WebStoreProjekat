import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductCass } from '../models/product/productCass';

@Injectable({
  providedIn: 'root'
})
export class CasPopularnoService {

  constructor(private httpClient: HttpClient) { }

  getCassandraPopularni(){
    return this.httpClient.get(`${environment.apiURL}cas_popularno`);
  }

  //TEST THIS
  addCassandraPopularni(proizvodi: ProductCass[]){
    return this.httpClient.post(`${environment.apiURL}cas_popularno/dodajNovePopularne`, proizvodi);
  }

  deleteCassandraPopularni(){
    return this.httpClient.delete(`${environment.apiURL}cas_popularno/obrisiOceneIPopularno`);
  }
}
