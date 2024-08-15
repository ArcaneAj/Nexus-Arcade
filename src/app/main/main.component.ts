import { Component } from '@angular/core';
import { CalculationService } from '../services/calculation.service';
import { BaseComponent } from '../base.component';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';
import { PriceResultComponent } from "../price-result/price-result.component";

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [
    // Core
    CommonModule,
    // Custom components
    PriceResultComponent
],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent extends BaseComponent {
    public results: PriceResult[] = [];
    constructor(private calculationService: CalculationService) {
        super();
        this.subscription.add(this.calculationService.priceResults.subscribe(results => {
            console.log(results);
            this.results = results;
        }));
    }
}
