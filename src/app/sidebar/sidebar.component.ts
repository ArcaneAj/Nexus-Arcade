import { Component, OnDestroy, OnInit } from '@angular/core';
// Core
import { CommonModule } from '@angular/common';
// Angular material
import { FormsModule } from '@angular/forms';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AnimateModule } from 'primeng/animate';
import { InputComponent } from '../input/input.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        // Core
        CommonModule,
        // Angular material
        FormsModule,
        MatIconModule,
        MatListModule,
        ScrollingModule,
        MatCheckboxModule,
        // PrimeNG
        ToastModule,
        AnimateModule,
        // Custom components
        FilterPipe,
        OrderPipe,
        InputComponent,
        InputNumberComponent,
        ButtonComponent,
    ],
    providers: [FilterPipe, OrderPipe, MessageService],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent
    extends BaseComponent
    implements OnInit, OnDestroy
{
    public searchFilter: string = '';
    public changeFlag: boolean = false;
    public onlyCrafted: boolean = false;
    public minLevel: number = 0;
    public maxLevel: number = 999;

    public items: Item[] = [];

    constructor(
        private filterPipe: FilterPipe,
        private orderPipe: OrderPipe,
        private storage: StorageService,
        private universalis: UniversalisService,
        private xivApi: XivApiService,
        private calculationService: CalculationService,
        public settings: SettingsService,
        private messageService: MessageService
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscription.add(
            this.storage.MarketableItems().subscribe((items) => {
                this.setSelected(items, false);
                this.items = items;
                // this.selectFirst();
                // this.calculate();
            })
        );

        this.subscription.add(
            this.settings.worldChanged.subscribe((x) => this.calculate())
        );

        this.subscription.add(
            this.calculationService.deselect.subscribe((x) => {
                if (x.item != null) {
                    this.onSelect(x.item);
                }
            })
        );
    }

    private setSelected(items: Item[], selected: boolean): void {
        for (const item of items) {
            item.selected = selected;
        }
    }

    onSelect(item: Item): void {
        item.selected = !item.selected;
        this.changeFlag = !this.changeFlag;

        this.messageService.clear();
        if (item.selected) {
            this.messageService.add({
                severity: 'success',
                summary: 'Added ' + item.Name,
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Removed ' + item.Name,
            });
        }
    }

    selectFirst(): void {
        const orderedItems = this.orderPipe.transform(
            this.filterPipe.transform(
                this.items,
                this.searchFilter,
                this.onlyCrafted,
                this.minLevel,
                this.maxLevel
            ),
            false
        );
        for (const item of orderedItems) {
            if (!item.selected) {
                item.selected = true;
                this.changeFlag = !this.changeFlag;
                return;
            }
        }
    }

    deselectLast(): void {
        const orderedItems = this.orderPipe.transform(
            this.filterPipe.transform(
                this.items,
                this.searchFilter,
                this.onlyCrafted,
                this.minLevel,
                this.maxLevel
            ),
            false
        );
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
        this.setSelected(
            this.items.filter((x) => x.selected),
            false
        );
    }

    calculate(): void {
        const itemIds = this.items.filter((x) => x.selected).map((x) => x.id);
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
        this.subscription.add(
            this.storage.Recipes().subscribe((recipes) => {
                const tier0 = recipes.filter((x) =>
                    itemIds[depth].includes(x.id)
                );
                if (tier0.length === 0) {
                    this.fetchPrices(
                        itemIds[0],
                        itemIds.flat().unique(),
                        recipeCache.flat().toDict((item) => item.id)
                    );
                    return;
                }

                recipeCache[depth] = tier0;

                const tier1ids = tier0
                    .flatMap((x) => {
                        const jobIds = Object.keys(x.recipes);
                        if (jobIds.length === 0) return [];
                        return jobIds.flatMap((id) =>
                            x.recipes[+id].Ingredients.map(
                                (i) => i.itemId
                            ).concat(
                                x.recipes[+id].Crystals.map((i) => i.itemId)
                            )
                        );
                    })
                    .filter(
                        (value, index, array) => array.indexOf(value) === index
                    );

                itemIds[depth + 1] = tier1ids;
                this.discoverIngredientIds(itemIds, recipeCache, depth + 1);
            })
        );
    }

    private fetchPrices(
        rootIds: number[],
        itemIds: number[],
        recipeCache: { [id: number]: ItemRecipe }
    ): void {
        const observable = combineLatest({
            itemHistoryResponse: this.universalis.history(
                itemIds,
                this.settings.getCurrentWorld().dataCenter
            ),
            items: this.storage.Items(),
            gilShopIds: this.xivApi.gilShopItems(),
        });

        this.subscription.add(
            this.storage.Items().subscribe((items) => {
                this.calculationService.getPriceSkeleton(rootIds, items);
            })
        );
        console.log('Beginning market fetch.');
        const start = Date.now();
        this.subscription.add(
            observable.subscribe((x) => {
                console.log(
                    `Finished market fetch in ${Date.now() - start}ms.`
                );
                this.calculationService.calculatePrices(
                    rootIds,
                    recipeCache,
                    x.itemHistoryResponse,
                    x.items,
                    x.gilShopIds
                );
            })
        );
    }
}
