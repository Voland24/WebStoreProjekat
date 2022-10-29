import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ARadniciComponent } from './a-radnici.component';

describe('ARadniciComponent', () => {
  let component: ARadniciComponent;
  let fixture: ComponentFixture<ARadniciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ARadniciComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ARadniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
