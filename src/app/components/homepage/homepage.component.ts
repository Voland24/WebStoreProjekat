import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { UserLoginDto } from 'src/app/models/user/userLoginDto';
import { UserRegisterDto } from 'src/app/models/user/userRegisterDto';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from '../_modal';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  destroy$: Subject<boolean> = new Subject();
  userLoggedIn: boolean = false;
  //SAMO AKO je role u prikazujemo for you dugme
  userRole: string = '';

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  registerForm = new FormGroup({
    email: new FormControl(''),
    ime: new FormControl(''),
    prezime: new FormControl(''),
    telefon: new FormControl(''),
    password: new FormControl(''),
  });

  ngOnInit(): void {
    if (localStorage.getItem('username')) this.userLoggedIn = true;
    const role = localStorage.getItem('tip');
    if (role) this.userRole = role;
  }

  openModalForLogin() {
    this.modalService.open('login');
  }

  closeModalForLogin() {
    this.modalService.close('login');
  }

  openModalForRegister() {
    this.modalService.open('register');
  }

  closeModalForRegister() {
    this.modalService.close('register');
  }

  login() {
    let userLoginInfo: UserLoginDto = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };
    this.authService
      .login(userLoginInfo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.userLoggedIn = true;
          localStorage.setItem('username', this.loginForm.value.username);
          switch (response.tip) {
            case 'R': {
              this.userRole = 'R';
              this.router.navigate(['/selling-products']);
              break;
            }
            case 'A': {
              this.userRole = 'A';
              this.router.navigate(['/a-proizvodi']);
              break;
            }
            default: {
              this.userRole = 'K';
            }
          }
        },
        error: (err) => {
          console.log(err);
          this.toastrService.error('Greska prilikom login', 'Error');
        },
        complete: () => {
          this.modalService.close('login');
          location.reload();
        },
      });
  }

  register() {
    
    const username = this.registerForm.value.email.split('@')[0];
    
    const zaSlanje: UserRegisterDto = {
      email: this.registerForm.value.email,
      telefon: this.registerForm.value.telefon,
      ime: this.registerForm.value.ime,
      prezime: this.registerForm.value.prezime,
      password: this.registerForm.value.password,
      username: username
    };


    this.authService
      .register(zaSlanje)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          localStorage.setItem('username', username);
        },
        error: (err) => {
          console.log(err);
          this.toastrService.error('Greska prilikom register', 'Error');
        },
        complete: () => {
          this.modalService.close('register');
          location.reload();
        },
      });
  }
}
