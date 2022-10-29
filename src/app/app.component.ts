import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { AppState } from './store/app.state';
import * as CommonSelectors from './store/common/common.selectors';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'BazeProjekat';

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.loadSidebarStatus();
  }

  isSidebarShown: Observable<boolean> = of();

  loadSidebarStatus() : void{
    this.isSidebarShown = this.store.select(CommonSelectors.selectSidebarStatus);
  }
}
