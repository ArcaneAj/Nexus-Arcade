import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { combineLatest, forkJoin } from 'rxjs';
import { XivApiService } from '../services/xivapi.service';
import { CalculationService } from '../services/calculation.service';
import {
    MatCheckboxChange,
    MatCheckboxModule,
} from '@angular/material/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AnimateModule } from 'primeng/animate';
import { InputComponent } from '../input/input.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { ButtonComponent } from '../button/button.component';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';

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
    onCollectablesChange($event: MatCheckboxChange) {
        if ($event.checked) {
            this.items = this.collectables;
        } else {
            this.items = this.marketables;
        }
    }
    readonly dialog = inject(MatDialog);

    public searchFilter: string = '';
    public changeFlag: boolean = false;
    public onlyCrafted: boolean = false;
    public viewCollectables: boolean = false;
    public minLevel: number = 0;
    public maxLevel: number = 999;

    public items: Item[] = [];
    public marketables: Item[] = [];
    public collectables: Item[] = [];
    public dataCenters: DataCenter[] = [];
    public worlds: World[] = [];

    public count = 0;

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
        this.subscription.add(
            this.settings.Settings().subscribe((x) => {
                for (const setting of x) {
                    if (setting.name === 'onlyCrafted') {
                        this.onlyCrafted = setting.value;
                    }
                    if (setting.name === 'minLevel') {
                        this.minLevel = setting.value;
                    }
                    if (setting.name === 'maxLevel') {
                        this.maxLevel = setting.value;
                    }
                }
            })
        );
    }

    ngOnInit(): void {
        this.subscription.add(
            this.storage.MarketableItems().subscribe((items) => {
                this.setSelected(items, false);
                this.marketables = items;
                if (!this.viewCollectables) {
                    this.items = this.marketables;
                }
                // this.selectFirst();
                // this.selectFirst();
                // this.selectFirst();
                // this.calculate();
            })
        );

        const observable = forkJoin({
            items: this.xivApi.items(),
            collectables: this.xivApi.collectableShopItems(),
            scrip: this.xivApi.collectableShopRewardScrip(),
        });
        this.subscription.add(
            observable.subscribe((data) => {
                const collectableItems = data.items.filter(
                    (x) =>
                        x.IsCollectable &&
                        x.Name.toLowerCase().includes('rarefied')
                );
                const collectables: Item[] = [];
                for (const item of collectableItems) {
                    const collectableShopItem = data.collectables.find(
                        (c) => c.Item === item.id
                    );
                    const collectableShopRewardScrip = data.scrip.find(
                        (s) =>
                            s.id ===
                            collectableShopItem?.CollectablesShopRewardScrip
                    );

                    if (
                        collectableShopRewardScrip?.Currency === 2 ||
                        collectableShopRewardScrip?.Currency === 6
                    ) {
                        item.Price_Low_ =
                            collectableShopRewardScrip?.HighReward ?? 0;
                        collectables.push(item);
                    }
                }

                this.collectables = collectables;
                if (this.viewCollectables) {
                    this.items = this.collectables;
                    // this.selectFirst();
                    // this.selectFirst();
                    // this.selectFirst();
                    // this.selectFirst();
                    // this.selectFirst();
                    // this.calculate();
                }
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
        this.subscription.add(
            this.storage.DataCenters().subscribe((x) => (this.dataCenters = x))
        );
        this.subscription.add(
            this.storage.Worlds().subscribe((x) => (this.worlds = x))
        );
    }

    private setSelected(items: Item[], selected: boolean): void {
        for (const item of items) {
            item.selected = selected;
            if (item.selected !== selected) {
                this.count += selected ? 1 : -1;
            }
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
        this.count += item.selected ? 1 : -1;
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
                if (!item.selected) {
                    this.count += 1;
                }
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
                    if (previousItem.selected) {
                        this.count += -1;
                    }
                    previousItem.selected = false;
                    this.changeFlag = !this.changeFlag;
                }
                return;
            }

            previousItem = item;
        }

        if (previousItem !== null) {
            if (previousItem.selected) {
                this.count += -1;
            }
            previousItem.selected = false;
            this.changeFlag = !this.changeFlag;
        }
    }

    clearSelection(): void {
        this.setSelected(
            this.items.filter((x) => x.selected),
            false
        );
        this.count = 0;
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
            collectables: this.xivApi.collectableShopItems(),
            scrip: this.xivApi.collectableShopRewardScrip(),
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
                    x.gilShopIds,
                    x.collectables,
                    x.scrip
                );
            })
        );
    }

    public order() {
        const selectedItems = this.items.filter((x) => x.selected);

        const dialogRef = this.dialog.open(OrderDialogComponent, {
            data: {
                selectedItems,
                worlds: this.worlds,
                dataCenters: this.dataCenters,
            },
            height: '80vh',
        });

        dialogRef.afterClosed().subscribe((result: any) => {});
    }
}
