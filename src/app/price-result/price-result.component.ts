import { Component, computed, input } from '@angular/core';
import { PriceResult } from '../models/price-result.model';

@Component({
    selector: 'app-price-result',
    standalone: true,
    imports: [],
    templateUrl: './price-result.component.html',
    styleUrl: './price-result.component.scss'
})
export class PriceResultComponent {
    public result = input.required<PriceResult>();
    public name = computed(() => this.result().name);
    public marketPrice = computed(() => this.result().marketPrice);
    public shopPrice = computed(() => this.result().shopPrice);
    public cheapestCraft = computed(() => this.result().cheapestCraft);
    public shopProfit = computed(() => this.result().shopProfit);
    public craftProfit = computed(() => this.result().craftProfit);
}
