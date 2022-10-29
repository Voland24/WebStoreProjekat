import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AProdavniceComponent } from './a-prodavnice.component';

describe('AProdavniceComponent', () => {
  let component: AProdavniceComponent;
  let fixture: ComponentFixture<AProdavniceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AProdavniceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AProdavniceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
