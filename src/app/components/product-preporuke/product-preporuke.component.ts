import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NeoKorisnikService } from 'src/app/services/neo-korisnik.service';

@Component({
  selector: 'app-product-preporuke',
  templateUrl: './product-preporuke.component.html',
  styleUrls: ['./product-preporuke.component.scss'],
})
export class ProductPreporukeComponent implements OnInit {
  constructor(private neoKorisnikService: NeoKorisnikService) {}

  destroy$: Subject<boolean> = new Subject();
  products1: any | undefined = undefined;
  products2: any | undefined = undefined;
  products3: any | undefined = undefined;
  isOpen: boolean = false;

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {}

  //TODO: uradi preporuke za sve tri rute!
  loadPreporuke() {
    const username = localStorage.getItem('username');
    this.isOpen = !this.isOpen;
    if (username && this.isOpen) {
      this.neoKorisnikService
        .getPreporukeProizvodaMetodaPrva(username)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (proizvodi) => {
            this.products1 = proizvodi;
          },
          complete: () => {
            this.neoKorisnikService
              .getPreporukeProizvodaMetodaDruga(username)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (proizvodi) => {
                  this.products2 = proizvodi;
                },
                complete: () => {
                  this.neoKorisnikService
                    .getPreporukeProizvodaMetodaTreca(username)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: (proizvodi) => {
                        this.products3 = proizvodi;
                      },
                    });
                },
              });
          },
        });
    }
    if (!this.isOpen) {
      this.removePreporukeFromPage();
    }
  }

  removePreporukeFromPage() {
    this.products1 = undefined;
    this.products2 = undefined;
    this.products3 = undefined;
  }
}
