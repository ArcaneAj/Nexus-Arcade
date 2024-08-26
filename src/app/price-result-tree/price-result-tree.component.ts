import { Component, input } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-price-result-tree',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './price-result-tree.component.html',
    styleUrl: './price-result-tree.component.scss',
})
export class PriceResultTreeComponent {
    public result = input.required<PriceResult>();
    public depth = input.required<number>();
}
