import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceResultComponent } from './price-result.component';

describe('PriceResultComponent', () => {
  let component: PriceResultComponent;
  let fixture: ComponentFixture<PriceResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
