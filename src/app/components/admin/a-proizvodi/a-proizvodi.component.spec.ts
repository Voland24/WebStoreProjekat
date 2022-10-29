import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AProizvodiComponent } from './a-proizvodi.component';

describe('AProizvodiComponent', () => {
  let component: AProizvodiComponent;
  let fixture: ComponentFixture<AProizvodiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AProizvodiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AProizvodiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
