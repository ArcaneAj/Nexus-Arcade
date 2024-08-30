import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultsComponent } from './defaults.component';

describe('DefaultsComponent', () => {
  let component: DefaultsComponent;
  let fixture: ComponentFixture<DefaultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
