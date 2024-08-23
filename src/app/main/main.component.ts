import { Component, ElementRef, output, ViewChild } from '@angular/core';
import { CalculationService } from '../services/calculation.service';
import { BaseComponent } from '../base.component';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';
import { PriceResultComponent } from "../price-result/price-result.component";
import { CraftResult, getProfit } from '../models/craft-result.model';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [
    // Core
    CommonModule,
    // Angular material
    ScrollingModule,
    MatButtonToggleModule,
    MatIconModule,
    // Custom components
    PriceResultComponent
],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent extends BaseComponent {
    public resultsLength = output<number>();
    public results: PriceResult[] = [];
    public sortAscending = false;
    public sortCrafted = true;
    public disableModal = false;
    private useDcPrices = false;

    constructor(private calculationService: CalculationService) {
        super();
        this.resultsLength.emit(this.results.length);
        this.subscription.add(this.calculationService.priceResults.subscribe(results => {
            results = results.map(x => {
                const marketPrice = this.useDcPrices ? x.marketPriceDc : x.marketPriceWorld;
                x.cheapestCraft = x.craftedPrices.getMinByProperty<CraftResult>(x => x.price);
                x.shopProfit = getProfit(x.shopPrice, marketPrice);
                x.craftProfit = (x.cheapestCraft == null) ? 0 : getProfit(x.cheapestCraft.price, marketPrice * x.cheapestCraft.amount);
                return x;
            });
            
            this.results = this.sortResults(results);
            this.resultsLength.emit(this.results.length);
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
                craftable: false,
                itemLevel: 50,
                equipLevel: "50",
            },
            
            name: "Mocked Item",
            requiredAmount: 1,
            marketPriceDc: 5000,
            marketPriceWorld: 5000,
            shopPrice: 500,
            dc: "MockedDC",
            world: "MockedWorld",
            craftedPrices: [],
            cheapestCraft: undefined,
            shopProfit: 4500,
            craftProfit: undefined,
            nqSaleVelocity: 0,
            hqSaleVelocity: 0
        }
    }

    sortOrderChanged(event: MatButtonToggleChange) {
        this.sortAscending = event.value === "true";
        this.results = this.sortResults(this.results);
    }

    sortPropertyChanged(event: MatButtonToggleChange) {
        this.sortCrafted = event.value === "true";
        this.results = this.sortResults(this.results);
        this.resultsLength.emit(this.results.length);
    }

    sortResults(results: PriceResult[]): PriceResult[] {
        if (this.sortAscending) {
            return results.sortByPropertyAscending(x => this.sortCrafted ? x.craftProfit ?? Number.MAX_SAFE_INTEGER : x.shopProfit ?? Number.MAX_SAFE_INTEGER);
        } else {
            return results.sortByPropertyDescending(x => this.sortCrafted ? x.craftProfit ?? 0 : x.shopProfit ?? 0);
        }
    }

    clearResult(result: PriceResult) {
        this.results.splice(this.results.indexOf(result), 1);
        this.resultsLength.emit(this.results.length);
        this.calculationService.deselectItem(result);
    }

    clearResults() {
        this.results = [];
        this.resultsLength.emit(this.results.length);
    }
    
    @ViewChild('dialog', { static: false }) dialog: ElementRef | undefined;
    
    openModal() {
        if (this.dialog) {
            this.dialog.nativeElement.showModal();
        }
    }

    closeModal() {
        if (this.dialog) {
            this.dialog.nativeElement.close();
        }
    }
}