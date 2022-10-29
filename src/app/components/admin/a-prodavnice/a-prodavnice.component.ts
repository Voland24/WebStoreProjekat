import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Prodavnica } from 'src/app/models/prodavnica';
import { NeoProdavnicaService } from 'src/app/services/neo-prodavnica.service';
import { ModalService } from '../../_modal';

@Component({
  selector: 'app-a-prodavnice',
  templateUrl: './a-prodavnice.component.html',
  styleUrls: ['./a-prodavnice.component.scss'],
})
export class AProdavniceComponent implements OnInit {
  constructor(
    private neoProdavnicaService: NeoProdavnicaService,
    private toastrService: ToastrService,
    private modalService: ModalService
  ) {}

  destroy$: Subject<boolean> = new Subject();
  prodavnice: Observable<Prodavnica[]> | undefined = undefined;
  selectedProdavnica: Prodavnica | undefined = undefined;

  addForm = new FormGroup({
    grad: new FormControl(''),
    adresa: new FormControl(''),
    radnoVreme: new FormControl(''),
    telefon: new FormControl(''),
    email: new FormControl(''),
  });

  updateForm = new FormGroup({
    radnoVreme: new FormControl(''),
    telefon: new FormControl(''),
    email: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadProdavnice();
  }

  loadProdavnice() {
    this.prodavnice = this.neoProdavnicaService.getAllProdavnice();
  }

  openModal(modalName: string, prodavnica?: Prodavnica) {
    if (prodavnica) {
      this.selectedProdavnica = prodavnica;
      this.updateForm.patchValue({
        radnoVreme: this.selectedProdavnica.radnoVreme,
        telefon: this.selectedProdavnica.telefon,
        email: this.selectedProdavnica.email,
      });
    }
    this.modalService.open(modalName);
  }

  closeModal(modalName: string) {
    this.modalService.close(modalName);
  }

  izbrisiProdavnicu(prodavnica: Prodavnica) {
    this.neoProdavnicaService
      .deleteProdavnica(prodavnica)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastrService.success(
            'Uspesno ste obrisali prodavnicu',
            'Success'
          );
          this.loadProdavnice();
        },
      });
  }

  dodajProdavnicu() {
    const prodavnicaZaSlanje: Prodavnica = {
      grad: this.addForm.value.grad,
      adresa: this.addForm.value.adresa,
      email: this.addForm.value.email,
      radnoVreme: this.addForm.value.radnoVreme,
      telefon: this.addForm.value.telefon,
    };

    this.neoProdavnicaService
      .addProdavnica(prodavnicaZaSlanje)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastrService.success('Uspesno dodata prodavnica', 'Success');
          this.modalService.close('dodajProdavnicuModal');
          this.loadProdavnice();
        },
      });
  }

  updateProdavnica() {
    const email = this.updateForm.value.email;
    const telefon = this.updateForm.value.telefon;
    const radnoVreme = this.updateForm.value.radnoVreme;
    let prodavnicaZaSlanje: Prodavnica | undefined = undefined;
    if (this.selectedProdavnica)
      prodavnicaZaSlanje = {
        grad: this.selectedProdavnica.grad,
        adresa: this.selectedProdavnica.adresa,
        email,
        telefon,
        radnoVreme,
      };
    if (prodavnicaZaSlanje)
      this.neoProdavnicaService
        .updateProdavnica(prodavnicaZaSlanje)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.toastrService.success('Uspena izmena', 'Success');
            this.modalService.close('updateProdavnicaModal');
            this.loadProdavnice();
          },
        });
  }
}
