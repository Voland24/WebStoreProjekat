import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject, Subscription, take, takeUntil } from 'rxjs';
import { Prodavnica } from 'src/app/models/prodavnica';
import { ProductCatergory } from 'src/app/models/product/productCatergoryDto';
import { ProductCass } from 'src/app/models/product/productCass';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
import { NeoProdavnicaService } from 'src/app/services/neo-prodavnica.service';
import { NeoRadnikService } from 'src/app/services/neo-radnik.service';
import { ModalService } from '../../_modal';

@Component({
  selector: 'app-order-products',
  templateUrl: './order-products.component.html',
  styleUrls: ['./order-products.component.scss'],
})
export class OrderProductsComponent implements OnInit {
  constructor(
    private casProizvodService: CasProizvodService,
    private neoRadnikService: NeoRadnikService,
    private neoProdavnicaService: NeoProdavnicaService,
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

  //SUBS
  destroy$: Subject<boolean> = new Subject();
  productCategories: ProductCatergory[] = [];

  //OBSV
  products: Observable<ProductCass[]> | undefined = undefined;

  //HELP VARS
  productForOrdering: ProductCass | undefined = undefined;
  tempCategories: any;
  isSubcategoryShown: boolean[] = [];
  numberToOrder = new FormControl(0);

  getAllCategories(): void {
    this.casProizvodService
      .getKategorijeITipove()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.tempCategories = data;
          this.tempCategories.forEach((element: any) => {
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

  openModalForOrder(product: ProductCass, modalName: string) {
    this.productForOrdering = product;
    this.modalService.open(modalName);
  }

  orderThisProduct(numberOfProductsToOrder: number) {
    const username = localStorage.getItem("username");
    if (username && numberOfProductsToOrder > 0) {
      this.neoRadnikService
        .getInfoOProdavniciUKojojRadiRadnik(username)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (prodavnica) => {
            if (this.productForOrdering)
              this.neoProdavnicaService
                .naruciProizvod(
                  this.productForOrdering,
                  prodavnica,
                  numberOfProductsToOrder
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  complete: () => {
                    this.toastrService.success(
                      'Uspesno naruceni proizvodi',
                      'Success'
                    );
                    this.modalService.close('modal');
                  },
                });
          },
          error: () => {
            this.toastrService.error(
              'Doslo je do greske kod order u cass',
              'Error'
            );
          },
        });
    } else {
      this.toastrService.error('Unesite validan broj', 'Error');
    }
  }

  closeOrderModal(modalName: string) {
    this.modalService.close(modalName);
  }
}
