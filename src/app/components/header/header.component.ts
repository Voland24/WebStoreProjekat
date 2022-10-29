import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store/app.state';
import * as CommonSelectors from '../../store/common/common.selectors';
import * as CommonActions from '../../store/common/common.actions';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) {}

  sidebarStatus$: Observable<boolean> = of();
  sidebarStatus: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  //user definise da li je kupac ili prodavac ili admin
  role: string = '';
  username: string = '';

  ngOnInit(): void {
    this.sidebarStatus$ = this.store.select(
      CommonSelectors.selectSidebarStatus
    );
    const role = localStorage.getItem('tip');
    const username = localStorage.getItem('username');
    if (role) {
      this.role = role;
    } else this.role = 'K'
    if (username) {
      this.username = username;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  toggleCategories(): void {
    this.sidebarStatus$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
      this.sidebarStatus = !status;
    });
    this.store.dispatch(
      CommonActions.toggleSidebar({ sidebarStatus: this.sidebarStatus })
    );
  }

  logout() {
    this.authService.logout();
  }
}
