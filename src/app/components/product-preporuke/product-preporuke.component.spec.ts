import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPreporukeComponent } from './product-preporuke.component';

describe('ProductPreporukeComponent', () => {
  let component: ProductPreporukeComponent;
  let fixture: ComponentFixture<ProductPreporukeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPreporukeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPreporukeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
