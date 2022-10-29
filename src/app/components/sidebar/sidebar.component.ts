import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { ProductCatergory } from 'src/app/models/product/productCatergoryDto';
import { AppState } from 'src/app/store/app.state';
import * as CommonActions from '../../store/common/common.actions';
import { CasProizvodService } from 'src/app/services/cas-proizvod.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(private store: Store<AppState>, private router: Router, private casProizvodService: CasProizvodService) {}

  ngOnDestroy(): void {
    if(this.productCategoriesSub)
      this.productCategoriesSub.unsubscribe();
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.initSubcategoryShown();
  }

  productCategoriesSub: Subscription | undefined = undefined;
  productCategories: ProductCatergory[] = [];
  tempCategories: any;
  isSubcategoryShown: boolean[] = [];
  getAllCategories(): void {
    this.productCategoriesSub = this.casProizvodService.getKategorijeITipove().subscribe((data) => {
      this.tempCategories = data;
      this.tempCategories.forEach((element:any) => {
        const foundElement = this.productCategories.find((category: ProductCatergory)=> category.kategorija === element.kategorija);
        if(foundElement)
            foundElement.tipovi.push(element.tip);
        else{
          let noviElement: ProductCatergory = {
            kategorija: element.kategorija,
            tipovi: [element.tip]
          };
          this.productCategories.push(noviElement);
        }
      });
    });
  }


  initSubcategoryShown(): void{
    this.productCategories.forEach(()=>{
      this.isSubcategoryShown.push(false);
    });
  }

  toggleSubcategories(index:number){
    this.isSubcategoryShown[index] = !this.isSubcategoryShown[index]
  }

  hideSubcategories(index:number){
    this.isSubcategoryShown[index] = false;
  }

  moveToProductList(kategorija:string, tip: string){
    this.store.dispatch(CommonActions.toggleSidebar({sidebarStatus: false}));
    this.router.navigate(["products"], {queryParams: {kategorija, tip}})
  }
}
