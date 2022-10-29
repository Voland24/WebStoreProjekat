import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ProductCass } from 'src/app/models/product/productCass';
import { AppState } from 'src/app/store/app.state';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
import { NeoProizvodService } from 'src/app/services/neo-proizvod.service';
import { NeoKorisnikService } from 'src/app/services/neo-korisnik.service';
import { UserKomentar } from 'src/app/models/user/userComment';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private casProizvodService: CasProizvodService,
    private neoProizvodService: NeoProizvodService,
    private neoKorisnikService: NeoKorisnikService,
    private cartSerivce: CartService,
    private toastrService: ToastrService
  ) {}

  destroy$: Subject<boolean> = new Subject();
  product: ProductCass | undefined = undefined;
  comments: Observable<UserKomentar[]> | undefined = undefined;
  clickedOnRate: boolean = false;
  userComment = new FormControl('');

  ngOnInit(): void {
    const kategorija = this.route.snapshot.queryParamMap.get('kategorija');
    const tip = this.route.snapshot.queryParamMap.get('tip');
    const naziv = this.route.snapshot.queryParamMap.get('naziv');
    if (kategorija != null && tip != null && naziv != null) {
      this.loadProduct(kategorija, tip, naziv);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  loadProduct(kategorija: string, tip: string, naziv: string) {
    this.casProizvodService
      .getCassandraProizvodi(kategorija, tip, naziv, '', 'Naziv', 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        this.product = product[0];
        this.loadAllComments(this.product.naziv);
      });
  }

  loadAllComments(nazivProizvoda: string): void {
    this.comments =
      this.neoProizvodService.getKomentariIOceneZaProizvod(nazivProizvoda);
  }

  leaveComment(): void {
    if (this.product) {
      const username = localStorage.getItem('username');

      const forSend = {
        username: username,
        komentar: this.userComment.value,
        naziv: this.product.naziv,
      };

      this.userComment.setValue('');

      if (forSend.username)
        this.neoKorisnikService
          .ostaviKomentar(forSend.username, forSend.komentar, forSend.naziv)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            complete: () => {
              if (this.product) {
                this.toastrService.success(
                  'Uspesno ste komentarisali!',
                  'Success'
                );
                this.loadAllComments(this.product.naziv);
              }
            },
            error: (err) => {
              this.toastrService.info(
                'Ocenite proizvod / ne mozete dva put da komentarisete!',
                'Info'
              );
            },
          });
      else {
        this.toastrService.info(
          'Morate biti ulogovani da biste komentarisali',
          'Info'
        );
      }
    }
  }

  openRating(): void {
    this.clickedOnRate = true;
  }

  rateProduct(rating: number): void {
    if (this.product) {
      const naziv = this.product.naziv;
      const kategorija = this.product.kategorija;
      const tip = this.product.tip;
      const username = this.getUsername();

      if (username) {
        this.casProizvodService
          .updateCassandraOcenaProizvoda(this.product, rating, username)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            complete: () => {
              this.neoKorisnikService
                .oceniProizvod(username, rating, naziv)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  complete: () => {
                    this.loadProduct(kategorija, tip, naziv);
                    this.toastrService.success(
                      'Oba api dobra za rate',
                      'Success'
                    );
                  },
                  error: (err) => {
                    this.toastrService.info(
                      'Ne mozete da ocenite isti proizvod dvaput NEO',
                      'Info'
                    );
                    console.log(err);
                  },
                });
            },
            error: (err)=>{
              this.toastrService.info(
                'Ne mozete da ocenite isti proizvod dvaput CASS',
                'Info'
              );
              console.log(err);
            }
          });
        this.clickedOnRate = false;
      } else {
        this.toastrService.info(
          'Morate biti ulogovani da biste ocenili proizvod',
          'Info'
        );
      }
    } else {
      this.toastrService.error('WHOPS', 'Error');
    }
  }

  addToCart(): void {
    const username = this.getUsername();
    if (username && this.product) {
      this.cartSerivce.addToCart(this.product);
      this.toastrService.success('Dodat proizvod u korpu', 'Success');
    }else this.toastrService.info("Morate biti ulogovani da biste dodali proizvod u korpu!", "Info");
  }

  getUsername() {
    return localStorage.getItem('username');
  }
}
