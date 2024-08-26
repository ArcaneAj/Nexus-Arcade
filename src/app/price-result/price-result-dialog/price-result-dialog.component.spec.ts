import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceResultDialogComponent } from './price-result-dialog.component';

describe('PriceResultDialogComponent', () => {
    let component: PriceResultDialogComponent;
    let fixture: ComponentFixture<PriceResultDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PriceResultDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PriceResultDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
