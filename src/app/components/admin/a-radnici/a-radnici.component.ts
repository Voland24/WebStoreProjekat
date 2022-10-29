import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { Prodavnica } from 'src/app/models/prodavnica';
import { Radnik } from 'src/app/models/user/radnik';
import { RadnikIRadnoMesto } from 'src/app/models/user/radnikIRadnoMesto';
import { NeoProdavnicaService } from 'src/app/services/neo-prodavnica.service';
import { NeoRadnikService } from 'src/app/services/neo-radnik.service';
import { ModalService } from '../../_modal';

@Component({
  selector: 'app-a-radnici',
  templateUrl: './a-radnici.component.html',
  styleUrls: ['./a-radnici.component.scss'],
})
export class ARadniciComponent implements OnInit, OnDestroy {
  constructor(
    private neoRadnikService: NeoRadnikService,
    private modalService: ModalService,
    private neoProdavnicaService: NeoProdavnicaService,
    private toastrService: ToastrService
  ) {}

  destroy$: Subject<boolean> = new Subject<boolean>();
  radnici: Observable<RadnikIRadnoMesto[]> | undefined = undefined;
  selectedRadnik: RadnikIRadnoMesto | undefined = undefined;

  novaPoz: FormControl = new FormControl('');

  gradovi: string[] = [];
  gradIzabran: boolean = false;
  adrese: string[] = [];

  zaposliForm: FormGroup = new FormGroup({
    grad: new FormControl(''),
    adresa: new FormControl(''),
    pozicija: new FormControl(''),
    datum: new FormControl(''),
  });

  addForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    ime: new FormControl(''),
    prezime: new FormControl(''),
    password: new FormControl(''),
  });

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    
  }

  loadZaposljeniRadnici() {
    this.radnici = this.neoRadnikService.getSviRadniciSavInfoZaposljeni();
  }

  loadNezaposljeniRadnici() {
    this.radnici = this.neoRadnikService.getSviRadniciSavInfoNezaposljeni();
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

  //OVO SE OKIDA SAMO AKO NEMA PRODAVNICU U KOJOJ RADI
  zaposliRadnika(username: string) {
      const grad = this.zaposliForm.value.grad;
      const adresa =  this.zaposliForm.value.adresa;
      const datum = this.zaposliForm.value.datum;
      const pozicija = this.zaposliForm.value.pozicija;

    this.neoRadnikService.zaposliRadnika(username, grad, adresa, pozicija, datum).pipe(takeUntil(this.destroy$)).subscribe({
      complete: ()=>{
        this.toastrService.success("Uspeno ste zaposlili radnika", "Success");
        this.modalService.close("zaposliRadnikModal");
        this.loadZaposljeniRadnici();
      },
      error: ()=>{
        this.toastrService.error("Greska pri zaposljavanju", "Error");
      }
    });
  }

  izmeniRadnika(sviPodaciORadniku: RadnikIRadnoMesto) {
    this.neoRadnikService
      .updatePozicijaRadnika(sviPodaciORadniku, this.novaPoz.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastrService.success('Uspesno izmenjen radnik', 'Success');
          this.modalService.close('updateRadnikModal');
          this.novaPoz.setValue('');
          this.loadZaposljeniRadnici();
        },
        error: () => {
          this.toastrService.error(
            'Doslo je do greske prilikom izmene',
            'Error'
          );
        },
      });
  }

  otpustiRadnika(radnik: RadnikIRadnoMesto) {
    this.neoRadnikService.fireRadnik(radnik).pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => {
        this.toastrService.success("Uspesno otpusten radnik!", "Success");
        this.loadZaposljeniRadnici();
      },
      error: () =>{
        this.toastrService.error("Doslo je do greske prilikom otpustanja", "Error");
      }
    })
  }

  izbrisiRadnika(radnik: RadnikIRadnoMesto) {
    this.neoRadnikService.deleteRadnik(radnik.username).subscribe({
      complete: () => {
        this.toastrService.success('Uspesno obrisan radnik iz baze', 'Success');
        if(radnik.pozicija === "") this.loadNezaposljeniRadnici();
        else this.loadZaposljeniRadnici();
      },
      error: () => {
        this.toastrService.error(
          'Doslo je do greske prilikom brisanja',
          'Error'
        );
      },
    });
  }

  dodajRadnika() {
    const radnikToAdd: Radnik = {
      ime: this.addForm.value.ime,
      prezime: this.addForm.value.prezime,
      username: this.addForm.value.username,
      password: this.addForm.value.password,
    };
    this.addForm.reset();
    this.neoRadnikService
      .addRadnik(radnikToAdd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.success('Uspesno dodat radnik', 'Success');
        },
        complete: () => {
          setTimeout(() => {
            this.loadNezaposljeniRadnici();
            this.modalService.close('dodajRadnikModal');
          });
        },
        error: () => {
          this.toastrService.error(
            'Doslo je do greske prilikom kreiranja',
            'Error'
          );
          this.modalService.close('dodajRadnikModal');
        },
      });
  }

  openModal(modalID: string, radnik?: RadnikIRadnoMesto) {
    if (radnik) {
      this.selectedRadnik = radnik;
      this.modalService.open(modalID);
      if(modalID === "zaposliRadnikModal")
        this.initSviGradoviIAdrese();
    } else this.modalService.open(modalID);
  }

  closeModal(modalID: string) {
    this.modalService.close(modalID);
  }

  izaberiGrad(){
    const grad = this.zaposliForm.value.grad;
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
}
