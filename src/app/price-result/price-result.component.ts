import { Component, input } from '@angular/core';
import { PriceResult } from '../models/price-result.model';

@Component({
    selector: 'app-price-result',
    standalone: true,
    imports: [],
    templateUrl: './price-result.component.html',
    styleUrl: './price-result.component.scss'
})
export class PriceResultComponent {
    result = input.required<PriceResult>();
}
