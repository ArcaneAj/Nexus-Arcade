import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceResultTreeComponent } from './price-result-tree.component';

describe('PriceResultTreeComponent', () => {
    let component: PriceResultTreeComponent;
    let fixture: ComponentFixture<PriceResultTreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PriceResultTreeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PriceResultTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
