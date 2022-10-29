import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject, Subscription, takeUntil } from 'rxjs';
import { ProductCass } from 'src/app/models/product/productCass';
import { Proizvodjac } from 'src/app/models/product/proizvodjac';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
import { CasProizvodjacService } from 'src/app/services/cas-proizvodjac.service';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private casProizvodService: CasProizvodService,
    private casProizvodjacService: CasProizvodjacService
  ) {
    this.queryParamMapSub = route.queryParamMap.subscribe((params) => {
      const kategorija = params.get('kategorija');
      const tip = params.get('tip');
      if (kategorija != null && tip != null) {
        this.loadProducts(kategorija, tip, '', '', 'Cena', 0);
        this.loadProizvodjaci(kategorija, tip);
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  //SUBS'
  destroy$: Subject<boolean> = new Subject();
  queryParamMapSub: Subscription | undefined = undefined;

  //OBJECTS
  products: ProductCass[] | undefined = undefined;
  sviProizvodjaci: Observable<Proizvodjac[]> = of([]);

  //FILTERS
  searchValue: string  = "";
  proizvodjaciToFilterBy: string[] = [];
  selectedFilterOption: string = 'None';
  filters: string[] = ['None', 'Cena asc', 'Cena des', 'Ocena', 'Popust'];

  ngOnInit(): void {}

  loadProducts(
    kategorija: string,
    tip: string,
    naziv: string,
    proizvodjac: string,
    pretraga: string,
    ascending: number
  ): void {
    this.casProizvodService.getCassandraProizvodi(
      kategorija,
      tip,
      naziv,
      proizvodjac,
      pretraga,
      ascending
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (products: ProductCass[])=>{
        this.products = products;
      },
    });
  }

  loadProizvodjaci(kategorija: string, tip: string): void {
    this.sviProizvodjaci = this.casProizvodjacService.getAllProizvodjaci(
      kategorija,
      tip
    );
  }

  //NOTE: za sada cemo raditi sa samo jednim proizvodjacem
  loadProductsWithFilters(proizvodjaci: string[], filter: string) {
    const kategorija = this.route.snapshot.queryParamMap.get('kategorija');
    const tip = this.route.snapshot.queryParamMap.get('tip');
    //sortiranje po proizvodjacima
    if (kategorija != null && tip != null) {
      if (proizvodjaci[0] != null)
        this.loadProducts(
          kategorija,
          tip,
          '',
          proizvodjaci[0],
          'Proizvodjac',
          0
        );
      else {
        switch (filter) {
          case 'Cena des': {
            this.loadProducts(kategorija, tip, '', '', 'Cena', 0);
            break;
          }
          case 'Cena asc': {
            this.loadProducts(kategorija, tip, '', '', 'Cena', 1);
            break;
          }
          case 'Popust': {
            this.loadProducts(kategorija, tip, '', '', 'Popust', 1);
            break;
          }
          case 'Ocena': {
            this.loadProducts(kategorija, tip, '', '', 'Ocena', 0);
            break;
          }
          case 'None': {
            this.loadProducts(kategorija, tip, '', '', 'Cena', 1);
            break;
          }
          default: {
            this.loadProducts(kategorija, tip, '', '', 'Cena', 1);
          }
        }
      }
    }
  }

  filterByProizvodjaci(checked: boolean, manufacturer: string) {
    if (checked) {
      this.proizvodjaciToFilterBy.push(manufacturer);
      this.loadProductsWithFilters(
        this.proizvodjaciToFilterBy,
        this.selectedFilterOption
      );
    } else {
      this.proizvodjaciToFilterBy.splice(
        this.proizvodjaciToFilterBy.indexOf(manufacturer),
        1
      );
      this.loadProductsWithFilters(
        this.proizvodjaciToFilterBy,
        this.selectedFilterOption
      );
    }
  }

  filterBySelectedOption() {
    this.loadProductsWithFilters(
      this.proizvodjaciToFilterBy,
      this.selectedFilterOption
    );
  }
}
