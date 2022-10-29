import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user/userDto';
import { UserLoginDto } from '../models/user/userLoginDto';

@Injectable({
  providedIn: 'root',
})
export class NeoKorisnikService {
  constructor(private httpClient: HttpClient) {}

  getNeoKorisnik(username: string): Observable<User> {
    let params = new HttpParams();
    params = params.append('username', username);

    return this.httpClient.get<User>(`${environment.apiURL}neo_korisnik`, {
      params: params,
    });
  }

  //PASS ILI PASSWORD?
  addNeoKorisnik(user: User) {
    const body = {
      email: user.email,
      ime: user.ime,
      prezime: user.prezime,
      pass: user.password,
      telefon: user.telefon,
      username: user.username,
    };

    return this.httpClient.post(
      `${environment.apiURL}neo_korisnik/dodajKorisnika`,
      body
    );
  }

  updateNeoKorisnik(
    username: string,
    zaAzurirati: string,
    noviTel?: string,
    noviPass?: string
  ) {
    let body;
    if (zaAzurirati === 'BrojTelefona') {
      body = {
        username: username,
        telefon: noviTel,
      };
    } else {
      body = {
        username: username,
        noviPass: noviPass,
      };
    }

    return this.httpClient.put(
      `${environment.apiURL}neo_korisnik/azurirajKorisnika`,
      body
    );
  }

  getSvojeTransakcije(username: string) {
    let params = new HttpParams();
    params = params.append('username', username);

    return this.httpClient.get(
      `${environment.apiURL}neo_korisnik/pogledajSvojeTransakcije`,
      {
        params: params,
      }
    );
  }

  ostaviKomentar(username: string, komentar: string, naziv: string) {
    const body = {
      username,
      komentar,
      naziv,
    };
    return this.httpClient.post(
      `${environment.apiURL}neo_korisnik/komentarisiProizvod`,
      body,
      { responseType: 'text' }
    );
  }

  oceniProizvod(username: string, ocena: number, naziv: string) {
    const body = {
      username,
      ocena,
      naziv,
    };
    return this.httpClient.post(
      `${environment.apiURL}neo_korisnik/oceniProizvod`,
      body,
      { responseType: 'text' }
    );
  }


  kupiProizvode(username: string, nizProizvoda: string[]){
    const body = {
      username,
      nizProizvoda
    }
    return this.httpClient.post(
      `${environment.apiURL}neo_korisnik/kupiProizvode`,
      body,
      { responseType: 'text' }
    );
  }
  //TODO: pitaj koja ruta od tri u neo_korisnik da se iskoristi
  getPreporukeProizvodaMetodaPrva(username: string) {
    let params = new HttpParams();
    params = params.append("username", username);

    return this.httpClient.get(
      `${environment.apiURL}neo_korisnik/preporuceniProizvodiMetodaPrva`,
      {
        params: params,
      }
    );
  }

  getPreporukeProizvodaMetodaDruga(username: string) {
    let params = new HttpParams();
    params = params.append("username", username);

    return this.httpClient.get(
      `${environment.apiURL}neo_korisnik/preporuceniProizvodiMetodaDruga`,
      {
        params: params,
      }
    );
  }

  getPreporukeProizvodaMetodaTreca(username: string) {
    let params = new HttpParams();
    params = params.append("username", username);

    return this.httpClient.get(
      `${environment.apiURL}neo_korisnik/preporuceniProizvodiMetodaTreca`,
      {
        params: params,
      }
    );
  }

  loginKorisnik(userLoginDto: UserLoginDto){
    return this.httpClient.post(`${environment.apiURL}neo_korisnik/loginKorisnik`, userLoginDto)
  }
}
