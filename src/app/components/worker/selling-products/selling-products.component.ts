import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ProductCartNeo } from 'src/app/models/cart/productCartNeo';
import { Prodavnica } from 'src/app/models/prodavnica';
import { ProductCatergory } from 'src/app/models/product/productCatergoryDto';
import { ProductNeo } from 'src/app/models/product/productNeo';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
import { CasTransakcijaService } from 'src/app/services/cas-transakcija.service';
import { NeoKorisnikService } from 'src/app/services/neo-korisnik.service';
import { NeoProdavnicaService } from 'src/app/services/neo-prodavnica.service';
import { NeoRadnikService } from 'src/app/services/neo-radnik.service';
@Component({
  selector: 'app-selling-products',
  templateUrl: './selling-products.component.html',
  styleUrls: ['./selling-products.component.scss'],
})
export class SellingProductsComponent implements OnInit {
  constructor(
    private casProizvodService: CasProizvodService,
    private neoProdavnicaService: NeoProdavnicaService,
    private neoRadnikService: NeoRadnikService,
    private neoKorisnikService: NeoKorisnikService,
    private casTransakcijaService: CasTransakcijaService,
    private toastrService: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.initGradAndAdresaProdavnice();
  }

  productCategories: ProductCatergory[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  products: any;

  productsForSelling: ProductCartNeo[] | undefined = undefined;
  numberOfProductsForSelling: number[] | undefined = undefined;

  usernameKorisnika = new FormControl('');
  isSubcategoryShown: boolean[] = [];
  numberToOrder = new FormControl(0);
  prodavnica: Prodavnica | undefined = undefined;

  searchValue: string = "";

  initGradAndAdresaProdavnice() {
    const username = localStorage.getItem('username');
    this.productsForSelling = undefined;
    if (username)
      this.neoRadnikService
        .getInfoOProdavniciUKojojRadiRadnik(username)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (prodavnica: Prodavnica) => {
            this.prodavnica = prodavnica;
          },
          complete: () => {
            if (this.prodavnica) this.loadProducts(this.prodavnica);
          },
          error: () => {
            this.toastrService.error(
              'Niste trenutno zaposljeni, kontaktirajte admina',
              'Info'
            );
          },
        });
  }

  loadProducts(prodavnica: Prodavnica) {
    this.neoProdavnicaService
      .getSveProizvodeProdavnice(prodavnica)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (niz) => {
          niz.sort((el1, el2) => {
            if (el1.proizvod.naziv > el2.proizvod.naziv) return 1;
            else if (el1.proizvod.naziv < el2.proizvod.naziv) {
              return -1;
            } else return 0;
          });
          this.products = niz;
        },
      });
  }

  addToSellList(product: ProductNeo) {
    if (this.productsForSelling) {
      let index = this.productsForSelling.findIndex((el: ProductCartNeo) => {
        return el.product.naziv === product.naziv;
      });
      if (index == -1) {
        let productToPush: ProductCartNeo = {
          product: product,
          brojProizvoda: 1,
        };
        this.productsForSelling.push(productToPush);
      } else {
        this.productsForSelling[index].brojProizvoda++;
      }
    } else {
      this.productsForSelling = [];
      let productToPush: ProductCartNeo = {
        product: product,
        brojProizvoda: 1,
      };
      this.productsForSelling.push(productToPush);
    }
  }

  reduceNumberFromSellList(productToRemove: ProductNeo) {
    if (this.productsForSelling) {
      const index = this.productsForSelling.findIndex(
        (el: ProductCartNeo) => el.product.naziv === productToRemove.naziv
      );
      if (this.productsForSelling[index].brojProizvoda == 1) {
        this.productsForSelling.splice(index, 1);
      } else {
        this.productsForSelling[index].brojProizvoda--;
      }
      if (this.productsForSelling.length == 0) {
        this.productsForSelling = undefined;
      }
    }
  }

  //TODO ako imas vremena - brises celu stavku bez obzira koliko ima kopija
  removeItemFromSellList() {}

  napraviNizNazivaZaSlanje(proizvodi: ProductCartNeo[]) {
    let nizNaziva;
    nizNaziva = proizvodi.map((element: ProductCartNeo) => {
      return element.product.naziv;
    });
    return nizNaziva;
  }

  izracunajUkupnuCenu(proizvodi: ProductCartNeo[]) {
    const ukupnaCena = proizvodi
      .map(
        (element: ProductCartNeo) =>
          (element.product.cena -
            (element.product.cena * element.product.popust) / 100) *
          element.brojProizvoda
      )
      .reduce((broj1: number, broj2: number) => {
        return broj1 + broj2;
      });
    return ukupnaCena;
  }

  napraviNizBrojaProizvoda(proizvodi: ProductCartNeo[]) {
    let nizBrojaProizvoda;
    nizBrojaProizvoda = proizvodi.map((element: ProductCartNeo) => {
      return element.brojProizvoda;
    });
    return nizBrojaProizvoda;
  }

  proveriValidnostProizvoda(proizvodiZaKupuvanje: ProductCartNeo[]): boolean {
    let valid = true;

    proizvodiZaKupuvanje.forEach((element: ProductCartNeo) => {
      const foundProduct: ProductCartNeo = this.products.find(
        (el: any) => element.product.naziv === el.proizvod.naziv
      );
      if (
        foundProduct &&
        (foundProduct.brojProizvoda === 0 ||
          foundProduct.brojProizvoda < element.brojProizvoda)
      ) {
        valid = false;
      }
    });

    return valid;
  }

  kupiProizvode() {
    let nizNaziva: string[] = [];
    let nizBrojaProizvoda: number[] = [];
    let ukupnaCena: number = 0;
    let valid: boolean = true;
    if (this.productsForSelling) {
      valid = this.proveriValidnostProizvoda(this.productsForSelling);
      nizNaziva = this.napraviNizNazivaZaSlanje(this.productsForSelling);
      nizBrojaProizvoda = this.napraviNizBrojaProizvoda(
        this.productsForSelling
      );
      ukupnaCena = this.izracunajUkupnuCenu(this.productsForSelling);
    }
    const naziviZaSlanjeCass = nizNaziva.join('\r\n');
    const usernameKorisnika = this.usernameKorisnika.value;

    if (valid && this.prodavnica)
      this.casTransakcijaService
        .addTransakcija(
          false,
          this.prodavnica.grad,
          this.prodavnica.adresa,
          naziviZaSlanjeCass,
          ukupnaCena,
          usernameKorisnika
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            if (this.prodavnica)
              this.neoProdavnicaService
                .dektementirajBrojProizvodaMagacina(
                  this.prodavnica.grad,
                  this.prodavnica.adresa,
                  nizNaziva,
                  nizBrojaProizvoda
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  complete: () => {
                    this.toastrService.success(
                      'Uspesno ste kupili proizvode',
                      'Sucess'
                    );
                    //OPCIONO (ako se unese username korisnika)
                    if (usernameKorisnika != '')
                      this.neoKorisnikService
                        .kupiProizvode(this.usernameKorisnika.value, nizNaziva)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                          complete: () => {
                            this.toastrService.success(
                              'Uspesno ste zabelezili kupovinu sa nalogom',
                              'Success'
                            );
                            this.initGradAndAdresaProdavnice();
                            this.usernameKorisnika.setValue('');
                          },
                          error: () => {
                            this.toastrService.error(
                              'Doslo do greske u /kupiProizvode',
                              'Error'
                            );
                          },
                        });
                    else {
                      this.initGradAndAdresaProdavnice();
                    }
                  },
                  error: () => {
                    this.toastrService.error(
                      'Doslo do greske u /dekrement',
                      'Error'
                    );
                  },
                });
          },
          error: () => {
            this.toastrService.error(
              'Doslo do greske u /dodajTransakciju',
              'Error'
            );
          },
        });
    else {
      this.toastrService.error(
        'Nema dovoljno na stanju',
        'Error'
      );
    }
  }
}
