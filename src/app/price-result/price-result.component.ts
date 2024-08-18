import { Component, computed, ElementRef, input, ViewChild } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { CommonModule } from '@angular/common';
import { CraftResult, getProfit } from '../models/craft-result.model';
import { PriceResultTreeComponent } from '../price-result-tree/price-result-tree.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-price-result',
    standalone: true,
    imports: [
        CommonModule,
        PriceResultTreeComponent,
        MatButtonModule,
    ],
    templateUrl: './price-result.component.html',
    styleUrl: './price-result.component.scss'
})
export class PriceResultComponent {
    Number = Number;
    public sortCrafted = input.required<boolean>();
    public result = input.required<PriceResult>();
    public name = computed(() => this.result().name);
    public marketPrice = computed(() => Math.round(this.result().marketPrice ?? 0));
    public shopPrice = computed(() => this.result().shopPrice);
    public cheapestCraft = computed(() => {
        console.log(this.result());
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
        if (this.marketPrice() !== 0 && this.sortCrafted() && this.cheapestCraftPrice() < 999999) {
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
}

function populateCheapestTree(cheapestCraft: CraftResult) {
    const craftComponents = [];
    const buyComponents = [];
    for (const component of cheapestCraft.components) {
        component.cheapestCraft = component.craftedPrices.getMinByProperty<CraftResult>(x => x.price);
        component.shopProfit = getProfit(component.shopPrice, component.marketPrice);
        component.craftProfit = getProfit(component.cheapestCraft?.price, component.marketPrice);
        if (component.cheapestCraft != null) {
            populateCheapestTree(component.cheapestCraft);
        }

        // Split the components up by whether they should be crafted or bought to be grouped for display
        const shouldCraft = (component.cheapestCraft?.price ?? 999999) < (component.marketPrice ?? 999999);
        if (shouldCraft) {
            craftComponents.push(component)
        } else {
            buyComponents.push(component);
        }
    }
    
    cheapestCraft.components = [ ...craftComponents, ...buyComponents];
}

