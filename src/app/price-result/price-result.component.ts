import { Component, computed, input } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { CraftResult } from '../models/craft-result.model';

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
    public craftedPrice = computed(() => this.getCheapestCraftResult(this.result().craftedPrices));
    public shopProfit = computed(() => this.getProfit(this.result().shopPrice, this.result().marketPrice));
    public craftProfit = computed(() => this.getProfit(this.craftedPrice()?.price, this.result().marketPrice));

    getProfit(buyPrice?: number, sellPrice?: number): number {
        if (sellPrice == null || buyPrice == null) {
            return 0;
        }

        if (sellPrice! <= buyPrice!) {
            return 0;
        }

        return sellPrice! - buyPrice!;
    }

    
    getCheapestCraftResult(craftResults: CraftResult[] | null): CraftResult | undefined {
        if (craftResults === null || craftResults.length === 0) {
            return undefined;
        }

        return craftResults.sort((a,b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0))[0]
    }
}
