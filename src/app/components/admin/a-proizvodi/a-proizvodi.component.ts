import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ProductCatergory } from 'src/app/models/product/productCatergoryDto';
import { ProductCass } from 'src/app/models/product/productCass';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
import { NeoProizvodService } from 'src/app/services/neo-proizvod.service';
import { ModalService } from '../../_modal';
import { ProductNeo } from 'src/app/models/product/productNeo';

@Component({
  selector: 'app-a-proizvodi',
  templateUrl: './a-proizvodi.component.html',
  styleUrls: ['./a-proizvodi.component.scss'],
})
export class AProizvodiComponent implements OnInit, OnDestroy {
  constructor(
    private casProizvodService: CasProizvodService,
    private neoProizvodService: NeoProizvodService,
    private modalService: ModalService,
    private toastrService: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.initSubcategoryShown();
  }

  destroy$: Subject<boolean> = new Subject();
  productCategories: ProductCatergory[] = [];

  products: Observable<ProductCass[]> | undefined = undefined;
  selectedProizvod: ProductCass | undefined = undefined;
  isSubcategoryShown: boolean[] = [];

  updateForm = new FormGroup({
    popust: new FormControl(''),
  });

  //TODO: uzmaju se slike sa file sistema!
  addForm = new FormGroup({
    naziv: new FormControl(''),
    kategorija: new FormControl(''),
    tip: new FormControl(''),
    cena: new FormControl(''),
    proizvodjac: new FormControl(''),
    opis: new FormControl(''),
    //slika: new FormControl('')
  });

  getAllCategories(): void {
    this.casProizvodService
      .getKategorijeITipove()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const tempCategories = data;
          tempCategories.forEach((element: any) => {
            const foundElement = this.productCategories.find(
              (category: ProductCatergory) =>
                category.kategorija === element.kategorija
            );
            if (foundElement) foundElement.tipovi.push(element.tip);
            else {
              let noviElement: ProductCatergory = {
                kategorija: element.kategorija,
                tipovi: [element.tip],
              };
              this.productCategories.push(noviElement);
            }
          });
        },
        error: () => {
          this.toastrService.error('Doslo je do greske', 'Error');
        },
      });
  }

  initSubcategoryShown(): void {
    this.productCategories.forEach(() => {
      this.isSubcategoryShown.push(false);
    });
  }

  toggleSubcategories(index: number) {
    this.isSubcategoryShown[index] = !this.isSubcategoryShown[index];
  }

  hideSubcategories(index: number) {
    this.isSubcategoryShown[index] = false;
  }

  loadProducts(kategorija: string, tip: string) {
    this.products = this.casProizvodService.getCassandraProizvodi(
      kategorija,
      tip,
      '',
      '',
      'Cena',
      0
    );
  }

  dodajProizvod() {
    console.log(this.addForm.value);
    const cassProizvod: ProductCass = {
      naziv: this.addForm.value.naziv,
      kategorija: this.addForm.value.kategorija,
      tip: this.addForm.value.tip,
      cena: this.addForm.value.cena,
      ocena: 0,
      popust: 0,
      slika: '',
      proizvodjac: this.addForm.value.proizvodjac,
      opis: this.addForm.value.opis,
    };

    const neoProizvod: ProductNeo = {
      naziv: this.addForm.value.naziv,
      kategorija: this.addForm.value.kategorija,
      tip: this.addForm.value.tip,
      cena: this.addForm.value.cena,
      popust: 0,
      slika: '',
      proizvodjac: this.addForm.value.proizvodjac,
      opis: this.addForm.value.opis,
      brojKupovina: 0,
      brojOcena: 0,
      zbirOcena: 0,
    };

    this.casProizvodService
      .addCassandraProizvod(cassProizvod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.success(
            'Uspesno ste dodali proizvod CASS',
            'Sucess'
          );
        },
        complete: () => {
          this.neoProizvodService
            .addNeoProizvod(neoProizvod)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              complete: () => {
                this.toastrService.success('Uspesno ste dodali proizvod NEO');
                this.loadProducts(neoProizvod.kategorija, neoProizvod.tip);
              },
            });
        },
        error: () => {
          this.toastrService.error('Doslo je do greske u cass', 'Error');
        },
      });
  }

  updateProizvod() {
    const novPopust = parseInt(this.updateForm.value.popust);
    if (this.selectedProizvod)
      if (this.selectedProizvod.popust !== novPopust) {
        this.updatePopustProizvoda(novPopust);
        this.modalService.close('izmeniProizvodModal');
      } else {
        this.toastrService.error('Izmenite popust', 'Error');
      }
  }

  updatePopustProizvoda(novPopust: number) {
    if (this.selectedProizvod)
      this.casProizvodService
        .updateCassandraPopustProizvoda(this.selectedProizvod, novPopust)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.toastrService.success('Uspesno promenjena ocena', 'Success');
            if (this.selectedProizvod)
              this.loadProducts(
                this.selectedProizvod.kategorija,
                this.selectedProizvod.tip
              );
          },
        });
  }

  obrisiProizvodeIzObeBaze(product: ProductCass) {
    this.obrisiProizvodIzCassandre(product);
  }

  obrisiProizvodIzCassandre(product: ProductCass) {
    this.casProizvodService
      .deleteCassandraProizvod(product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastrService.success(
            'Uspesno izbrisan proizvod CASS',
            'Success'
          );
          this.obrisiProizvodIzNeo(product);
        },
        error:()=>{
          this.toastrService.error("Doslo je do greske u cass", "Error");
        }
      });
  }

  obrisiProizvodIzNeo(product: ProductCass) {
    this.neoProizvodService
      .deleteNeoProizvod(product.naziv)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: ()=>{
          this.toastrService.success('Uspesno izbrisan proizvod NEO', 'Success');
          this.loadProducts(product.kategorija, product.tip);
        },
        error: ()=>{
          this.toastrService.error("Doslo je do greske u NEO", "Error");
        }
      });
  }

  openModal(modalName: string, product?: ProductCass) {
    if (product) {
      this.selectedProizvod = product;
      this.updateForm.patchValue({
        ocena: this.selectedProizvod.ocena.toFixed(2),
        popust: this.selectedProizvod.popust,
      });
    }
    this.modalService.open(modalName);
  }

  closeModal(modalName: string) {
    this.modalService.close(modalName);
  }
}
