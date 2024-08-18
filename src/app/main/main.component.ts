import { Component } from '@angular/core';
import { CalculationService } from '../services/calculation.service';
import { BaseComponent } from '../base.component';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';
import { PriceResultComponent } from "../price-result/price-result.component";
import { CraftResult } from '../models/craft-result.model';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [
    // Core
    CommonModule,
    // Angular material
    ScrollingModule,
    MatButtonToggleModule,
    // Custom components
    PriceResultComponent
],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent extends BaseComponent {

    public results: PriceResult[] = [this.mockResult()];
    public sortAscending = false;

    constructor(private calculationService: CalculationService) {
        super();
        this.subscription.add(this.calculationService.priceResults.subscribe(results => {
            console.log(results);
            results = results.map(x => {
                x.cheapestCraft = x.craftedPrices.getMinByProperty<CraftResult>(x => x.price);
                x.shopProfit = this.getProfit(x.shopPrice, x.marketPrice);
                x.craftProfit = this.getProfit(x.cheapestCraft?.price, x.marketPrice);
                return x;
            });
            
            this.results = this.sortResults(results);
        }));
    }

    mockResult(): PriceResult {
        return {
            item: {
                id: 1,
                selected: false,
                Singular: "Mocked Item",
                Plural: "Mocked Items",
                Description: "Item mocked for testing",
                Name: "Mocked Item",
                Icon: "Mocked.png",
                StackSize: 999,
                Price_Mid_: 500, // Shop purchase price
                Price_Low_: 1, // Shop sell price
            },
            
            name: "Mocked Item",
            requiredAmount: 1,
            marketPrice: 5000,
            shopPrice: 500,
            craftedPrices: [],
            cheapestCraft: undefined,
            shopProfit: 4500,
            craftProfit: undefined,
        }
    }

    sortOrderChanged(event: MatButtonToggleChange) {
        this.sortAscending = event.value === "true";
        this.results = this.sortResults(this.results);
    }

    sortResults(results: PriceResult[]): PriceResult[] {
        if (this.sortAscending) {
            return results.sortByPropertyAscending(x => x.craftProfit ?? 0);
        } else {
            return results.sortByPropertyDescending(x => x.craftProfit ?? 0);
        }
    }
    
    getProfit(buyPrice?: number, sellPrice?: number): number {
        if (sellPrice == null || buyPrice == null) {
            return 0;
        }

        if (sellPrice! <= buyPrice!) {
            return 0;
        }

        return Math.round(sellPrice! - buyPrice!);
    }
}
