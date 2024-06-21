import { Component } from '@angular/core';
import { CalculationService } from '../services/calculation.service';
import { BaseComponent } from '../base.component';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent extends BaseComponent {
    constructor(private calculationService: CalculationService) {
        super();
        this.subscription.add(this.calculationService.priceResults.subscribe(results => console.log(results)));
    }
}
