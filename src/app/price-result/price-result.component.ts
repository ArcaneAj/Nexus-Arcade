import { Component, computed, ElementRef, input, output, ViewChild } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';
import { CraftResult, getProfit } from '../models/craft-result.model';
import { PriceResultTreeComponent } from '../price-result-tree/price-result-tree.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-price-result',
    standalone: true,
    imports: [
        CommonModule,
        PriceResultTreeComponent,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './price-result.component.html',
    styleUrl: './price-result.component.scss'
})
export class PriceResultComponent {
    Number = Number;
    public clear = output<boolean>();
    public sortCrafted = input.required<boolean>();
    public result = input.required<PriceResult>();
    public name = computed(() => this.result().name);
    public marketPriceDc = computed(() => Math.round(this.result().marketPriceDc));
    public marketPriceWorld = computed(() => Math.round(this.result().marketPriceWorld));
    public shopPrice = computed(() => this.result().shopPrice);
    public cheapestCraft = computed(() => {
        const cheapestCraft = this.result().cheapestCraft;
        if (cheapestCraft != null) {
            populateCheapestTree(cheapestCraft);
        }
        return cheapestCraft;
    });
    public cheapestCraftPrice = computed(() => Math.round(this.cheapestCraft()?.price ?? Number.MAX_SAFE_INTEGER));
    public shopProfit = computed(() => this.result().shopProfit);
    public craftProfit = computed(() => this.result().craftProfit);

    @ViewChild('dialog', { static: false }) dialog: ElementRef | undefined;
    
    openModal() {
        if (this.marketPriceDc() !== 0 && this.sortCrafted() && this.cheapestCraftPrice() < 999999) {
            if (this.dialog) {
                this.dialog.nativeElement.showModal();
            }
        }
    }

    closeModal() {
        if (this.dialog) {
            this.dialog.nativeElement.close();
        }
    }

    onRightClick(event: MouseEvent) {
        event.preventDefault();
        this.clear.emit(true);
    }
}

function populateCheapestTree(cheapestCraft: CraftResult) {
    const craftComponents = [];
    const buyComponents = [];
    for (const component of cheapestCraft.components) {
        component.cheapestCraft = component.craftedPrices.getMinByProperty<CraftResult>(x => x.price);
        component.shopProfit = getProfit(component.shopPrice, component.marketPriceDc);
        component.craftProfit = getProfit(component.cheapestCraft?.price, component.marketPriceDc);
        if (component.cheapestCraft != null) {
            populateCheapestTree(component.cheapestCraft);
        }

        // Split the components up by whether they should be crafted or bought to be grouped for display
        const shouldCraft = (component.cheapestCraft?.price ?? 999999) < (component.marketPriceDc ?? 999999);
        if (shouldCraft) {
            craftComponents.push(component)
        } else {
            buyComponents.push(component);
        }
    }
    
    cheapestCraft.components = [ ...craftComponents, ...buyComponents];
}

