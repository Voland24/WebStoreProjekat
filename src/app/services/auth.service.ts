import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserLoginDto } from '../models/user/userLoginDto';
import { UserLoginResponse } from '../models/user/userLoginResponse';
import { UserRegisterDto } from '../models/user/userRegisterDto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public jwtHelper: JwtHelperService,
    private httpClient: HttpClient,
    private router: Router
  ) {}

  decodedToken: any;

  user$: Observable<UserLoginDto> | undefined = undefined;

  login(user: UserLoginDto) {
    return this.httpClient
      .post(`${environment.apiURL}neo_korisnik/loginKorisnik`, user)
      .pipe(
        map((response: any) => {
          if (response.token != '') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('tip', response.tip);
          }
          return response;
        })
      );
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (token) return true;
    else return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tip');
    localStorage.removeItem('username');
    this.router.navigate(['/']);
    location.reload();
  }

  register(user: UserRegisterDto) {
    return this.httpClient
      .post(`${environment.apiURL}neo_korisnik/dodajKorisnika`, user , {responseType: 'text'})
      .pipe(
        map((token: any) => {
          if (token != '') {
            localStorage.setItem('token', token);
            localStorage.setItem('tip', 'K');
          }
          return token;
        })
      );
  }
}
