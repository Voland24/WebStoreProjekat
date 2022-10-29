import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPopularnoComponent } from './product-popularno.component';

describe('ProductPopularnoComponent', () => {
  let component: ProductPopularnoComponent;
  let fixture: ComponentFixture<ProductPopularnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPopularnoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPopularnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
