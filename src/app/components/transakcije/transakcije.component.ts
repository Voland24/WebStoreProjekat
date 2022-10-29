import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject, Subscription, take, takeUntil } from 'rxjs';
import { Prodavnica } from 'src/app/models/prodavnica';
import { CasTransakcijaService } from 'src/app/services/cas-transakcija.service';
import { NeoKorisnikService } from 'src/app/services/neo-korisnik.service';
import { NeoProdavnicaService } from 'src/app/services/neo-prodavnica.service';
import { NeoRadnikService } from 'src/app/services/neo-radnik.service';

@Component({
  selector: 'app-transakcije',
  templateUrl: './transakcije.component.html',
  styleUrls: ['./transakcije.component.scss'],
})
export class TransakcijeComponent implements OnInit, OnDestroy {
  constructor(
    private toastrService: ToastrService,
    private neoProdavnicaService: NeoProdavnicaService,
    private casTransakcijaService: CasTransakcijaService,
    private neoRadnikService: NeoRadnikService,
    private neoKorisnikService: NeoKorisnikService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('tip');
    if (role) {
      this.userRole = role;
    }
    if (this.userRole === 'R') this.initGradAndAdresaProdavniceRadnik();
    else if (this.userRole === 'A') this.initSviGradoviIAdrese();
    else if (this.userRole === 'K') this.prikaziKorisnikTransakcije();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  //SUBS
  destroy$: Subject<boolean> = new Subject();
  //OBV
  prodavnice: Observable<Prodavnica[]> | undefined = undefined;
  transakcije: any | undefined = undefined; 
  prodavnica: Prodavnica | undefined = undefined;
  onlineTransakcije: any | undefined = undefined;
  
  //HELP VARS
  meseci = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAJ',
    'JUN',
    'JUL',
    'AVG',
    'SEP',
    'OKT',
    'NOV',
    'DEC',
  ];
  userRole = '';
  gradRadnika: string = '';
  adresaRadnika: string = '';

  gradovi: string[] = [];
  gradIzabran: boolean = false;
  adrese: string[] = [];

  transakcijeForm = new FormGroup({
    godina: new FormControl(''),
    kvartal: new FormControl(''),
    mesec: new FormControl(''),
    grad: new FormControl(''),
    adresa: new FormControl(''),
  });
  
  onlineTransakcijeForm = new FormGroup({
    godina: new FormControl(''),
    kvartal: new FormControl(''),
    mesec: new FormControl(''),
  });

  initGradAndAdresaProdavniceRadnik() {
    const username = localStorage.getItem('username');
    if (username)
      this.neoRadnikService
        .getInfoOProdavniciUKojojRadiRadnik(username)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (prodavnica: Prodavnica) => {
            this.prodavnica = prodavnica;
            this.gradRadnika = this.prodavnica.grad;
            this.adresaRadnika = this.prodavnica.adresa;
          },
        });
  }

  initSviGradoviIAdrese() {
    this.neoProdavnicaService
      .getAllProdavnice()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prodavnice: Prodavnica[]) => {
          prodavnice.forEach((prodavnica) => {
            const nadjenGrad = this.gradovi.find(
              (grad: string) => grad === prodavnica.grad
            );
            if (!nadjenGrad) this.gradovi.push(prodavnica.grad);
          });
        },
      });
  }

  pretraziTransakcije() {
    const paramsForSearch = this.transakcijeForm.value;
    let godina = paramsForSearch.godina;
    let kvartal = paramsForSearch.kvartal;
    let mesec = paramsForSearch.mesec;
    let grad = '';
    let adresa = '';

    if (this.userRole === 'R') {
      this.casTransakcijaService
        .getTransakcijeProdavnice(
          parseInt(godina),
          parseInt(kvartal),
          mesec,
          this.gradRadnika,
          this.adresaRadnika
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (info) => {
            if (info.length > 0) {
              this.transakcije = info;
            } else
              this.toastrService.info(
                'Ne postoje transakcije u ovom periodu',
                'Info'
              );
          },
        });
    } else {
      grad = paramsForSearch.grad;
      adresa = paramsForSearch.adresa;
      this.casTransakcijaService
        .getTransakcijeProdavnice(
          parseInt(godina),
          parseInt(kvartal),
          mesec,
          grad,
          adresa
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (info) => {
            if (info.length > 0) {
              this.transakcije = info;
            } else
              this.toastrService.info(
                'Ne postoje transakcije u ovom periodu',
                'Info'
              );
          },
        });
    }
  }

  pretraziOnlineTransakcije(){
    const paramsForSearch = this.onlineTransakcijeForm.value;
    console.log(paramsForSearch);
    let godina = paramsForSearch.godina;
    let kvartal = paramsForSearch.kvartal;
    let mesec = paramsForSearch.mesec;
    if(this.userRole === 'A'){
      this.casTransakcijaService.getOnlineTransakcije(parseInt(godina), parseInt(kvartal), mesec).pipe(takeUntil(this.destroy$)).subscribe({
        next: (info)=>{
          this.onlineTransakcije = info;
        },
        error: (err)=>{
          console.log(err);
          this.toastrService.error("Greska prilikom ucitavanja online transakcija", "Error");
        }
      })
    }
  }

  izaberiGrad() {
    const grad = this.transakcijeForm.value.grad;
    this.adrese = [];
    this.neoProdavnicaService
      .getProdavniceUGradu(grad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          info.forEach((element) => {
            this.adrese.push(element.adresa);
          });
        },
      });
    this.gradIzabran = true;
  }

  prikaziKorisnikTransakcije() {
    const username = localStorage.getItem('username');
    if (username) {
      this.neoKorisnikService
        .getSvojeTransakcije(username)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (info) => {
            console.log(info);
            this.transakcije = info;
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  odvediNaStranicuProizvoda(transakcija: any){
    this.router.navigate(["product-detail"], {queryParams:{
      naziv: transakcija.naziv,
      kategorija: transakcija.kategorija,
      tip: transakcija.tip
    }});
  }
}
