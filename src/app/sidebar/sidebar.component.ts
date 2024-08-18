import { Component, OnDestroy, OnInit } from '@angular/core';
// Core
import { CommonModule } from '@angular/common';
// Angular material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';
// Custom components
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderPipe } from '../pipes/order.pipe';

import { BaseComponent } from '../base.component';
import { StorageService } from '../services/storage.service';
import { SettingsService } from '../services/settings.service';
import { Item } from '../models/item.model';
import { UniversalisService } from '../services/universalis.service';
import { ItemRecipe } from '../models/item-recipe.model';
import { combineLatest } from 'rxjs';
import { XivApiService } from '../services/xivapi.service';
import { CalculationService } from '../services/calculation.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        // Core
        CommonModule,
        // Angular material
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        ScrollingModule,
        // Custom components
        FilterPipe,
        OrderPipe,
    ],
    providers: [FilterPipe, OrderPipe],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent extends BaseComponent implements OnInit, OnDestroy {

    public searchFilter: string = '';
    public changeFlag: boolean = false;

    public items: Item[] = [];

    constructor(
        private filterPipe: FilterPipe,
        private orderPipe: OrderPipe,
        private storage: StorageService,
        private universalis: UniversalisService,
        private xivApi: XivApiService,
        private calculationService: CalculationService,
        public settings: SettingsService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscription.add(this.storage.MarketableItems().subscribe(items => {
            this.setSelected(items, false);
        }));
    }

    private setSelected(items: Item[], selected: boolean): void {
        const initialisedItems = [...items];
        for (const item of initialisedItems) {
            item.selected = selected;
        }

        this.items = initialisedItems;
    }

    onSelect(item: Item): void {
        item.selected = !item.selected;
        this.changeFlag = !this.changeFlag;
    }

    selectFirst(): void {
        const orderedItems = this.orderPipe.transform(this.filterPipe.transform(this.items, this.searchFilter), false);
        for (const item of orderedItems) {
            if (!item.selected) {
                item.selected = true;
                this.changeFlag = !this.changeFlag;
                return;
            }
        }
    }

    deselectLast(): void {
        const orderedItems = this.orderPipe.transform(this.filterPipe.transform(this.items, this.searchFilter), false);
        let previousItem = null;
        for (const item of orderedItems) {
            if (!item.selected) {
                if (previousItem !== null) {
                    previousItem.selected = false;
                    this.changeFlag = !this.changeFlag;
                }
                return;
            }

            previousItem = item;
        }

        if (previousItem !== null) {
            previousItem.selected = false;
            this.changeFlag = !this.changeFlag;
        }
    }

    clearSelection(): void {
        this.setSelected(this.items, false);
    }

    calculate(): void {
        const itemIds = this.items.filter(x => x.selected).map(x => x.id);
        if (itemIds.length === 0) {
            return;
        }

        this.discoverIngredientIds([itemIds], []);
    }

    private discoverIngredientIds(
        itemIds: number[][],
        recipeCache: ItemRecipe[][],
        depth: number = 0
    ): void {
        this.subscription.add(this.storage.Recipes().subscribe(recipes => {
            const tier0 = recipes.filter(x => itemIds[depth].includes(x.id));
            if (tier0.length === 0) {
                this.fetchPrices(
                    itemIds[0],
                    itemIds.flat().unique(),
                    recipeCache.flat().toDict((item) => item.id));
                return;
            }

            recipeCache[depth] = tier0;

            const tier1ids = tier0.flatMap(x => {
                const jobIds = Object.keys(x.recipes);
                if (jobIds.length === 0) return [];
                return jobIds.flatMap(id => x.recipes[+id].Ingredients.map(i => i.itemId).concat(x.recipes[+id].Crystals.map(i => i.itemId)))
            }).filter((value, index, array) => array.indexOf(value) === index);

            itemIds[depth + 1] = tier1ids;
            this.discoverIngredientIds(itemIds, recipeCache, depth + 1)
        }));
    }

    private fetchPrices(
        rootIds: number[],
        itemIds: number[],
        recipeCache: { [id: number] : ItemRecipe; }
    ): void {
        console.log(itemIds);
        const observable = combineLatest({
            itemHistoryResponse: this.universalis.history(itemIds, this.settings.getCurrentWorld().dataCenter),
            items: this.storage.Items(),
            gilShopIds: this.xivApi.gilShopItems(),
        })

        this.subscription.add(this.storage.Items().subscribe(items => {
            this.calculationService.getPriceSkeleton(rootIds, items);
        }));
        console.log('Beginning market fetch.');
        const start = Date.now();
        this.subscription.add(observable.subscribe(x => {
            console.log(`Finished market fetch in ${Date.now() - start}ms.`);
            this.calculationService.calculatePrices(rootIds, recipeCache, x.itemHistoryResponse, x.items, x.gilShopIds);
        }));
    }
}