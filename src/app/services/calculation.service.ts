import { Injectable } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { ItemRecipe } from '../models/item-recipe.model';
import { ItemsHistoryResponse } from '../models/items-history-response.model';
import { Item } from '../models/item.model';
import { CraftResult } from '../models/craft-result.model';
import { Ingredient } from '../models/ingredient.model';
import { ItemHistoryEntry } from '../models/item-history-entry.model';
import { Observable, Subject } from 'rxjs';
import { SettingsService } from './settings.service';
import { CollectableShopItem } from '../models/collectable-shop-item.model';
import { CollectablesShopRewardScrip } from '../models/collectable-shop-reward-scrip.model';

@Injectable({
    providedIn: 'root',
})
export class CalculationService {
    private priceResultsSubject: Subject<PriceResult[]> = new Subject<
        PriceResult[]
    >();
    public priceResults: Observable<PriceResult[]> =
        this.priceResultsSubject.asObservable();
    private deselectSubject: Subject<PriceResult> = new Subject<PriceResult>();
    public deselect: Observable<PriceResult> =
        this.deselectSubject.asObservable();

    private priceResultCache: {
        [dataCenter: string]: { [id: number]: PriceResult };
    };
    private recipeCache: { [id: number]: ItemRecipe } = {};
    private itemCache: { [id: number]: Item } = {};
    private itemHistoryResponse!: ItemsHistoryResponse;
    private gilShopIds: number[] = [];

    private collectables: { [id: number]: CollectableShopItem } = {};
    private scrip: { [id: number]: CollectablesShopRewardScrip } = {};

    constructor(private settings: SettingsService) {
        this.priceResultCache = {};
    }

    public deselectItem(result: PriceResult) {
        this.deselectSubject.next(result);
    }

    public getPriceSkeleton(rootIds: number[], items: Item[]): void {
        const itemDict = items.toDict((x) => x.id);
        this.priceResultsSubject.next(
            rootIds.map((id) => {
                const item = itemDict[id];
                const priceResult: PriceResult = {
                    item: item,
                    name: item.Name,
                    requiredAmount: 1,
                    craftedPrices: [
                        {
                            price: Number.MAX_SAFE_INTEGER,
                            components: [],
                            amount: 1,
                        },
                    ],
                    shopPrice: Number.MAX_SAFE_INTEGER,
                    nqSaleVelocity: 0,
                    hqSaleVelocity: 0,
                    marketPriceDc: 0,
                    marketPriceWorld: 0,
                    marketThroughputDc: 0,
                    marketThroughputWorld: 0,
                    dc: '',
                    world: '',
                    history: {
                        itemId: item.id,
                        dcName: '',
                        lastUploadTime: -1,
                        stackSizeHistogram: {},
                        stackSizeHistogramHQ: {},
                        stackSizeHistogramNQ: {},
                        regularSaleVelocity: 0,
                        nqSaleVelocity: 0,
                        hqSaleVelocity: 0,
                        expiry: new Date(),
                        entries: [],
                    },
                };
                return priceResult;
            })
        );
    }

    public calculatePrices(
        rootIds: number[],
        recipeCache: { [id: number]: ItemRecipe },
        itemHistoryResponse: ItemsHistoryResponse,
        items: Item[],
        gilShopIds: number[],
        collectables: CollectableShopItem[],
        scrip: CollectablesShopRewardScrip[]
    ): void {
        this.collectables = collectables.toDict((x) => x.Item);
        this.scrip = scrip.toDict((x) => x.id);
        this.recipeCache = Object.assign({}, this.recipeCache, recipeCache);
        this.itemCache = items.toDict((x) => x.id);
        this.itemHistoryResponse = itemHistoryResponse;
        this.gilShopIds = gilShopIds.unique().sort();
        this.priceResultCache = {};
        this.priceResultsSubject.next(
            rootIds.map((x) => this.getPriceForItem(x))
        );
    }

    private getPriceForItem(id: number): PriceResult {
        const currentDc = this.settings.getCurrentWorld().dataCenter.name;
        const currentWorld = this.settings.getCurrentWorld().name;
        if (id in this.priceResultCache) {
            return this.priceResultCache[currentDc][id];
        }

        const item = this.itemCache[id];
        if (item.IsCollectable) {
            let craftedPrices: CraftResult[] = this.getCraftedPrices(id);
            let scrips = 1;
            const scripsId = this.collectables[id]?.CollectablesShopRewardScrip;
            if (scripsId) {
                const reward = this.scrip[scripsId]?.HighReward;
                if (reward) {
                    scrips = reward;
                }
            }
            return {
                item,
                name: item.Name,
                requiredAmount: 1,
                craftedPrices,
                marketPriceDc: scrips,
                marketPriceWorld: scrips,
                marketThroughputDc: 1,
                marketThroughputWorld: 1,
                dc: currentDc,
                world: currentWorld,
                shopPrice: 0,
                nqSaleVelocity: 0,
                hqSaleVelocity: 1,
                history: {
                    itemId: item.id,
                    dcName: '',
                    lastUploadTime: 0,
                    stackSizeHistogram: {},
                    stackSizeHistogramNQ: {},
                    stackSizeHistogramHQ: {},
                    regularSaleVelocity: 1,
                    nqSaleVelocity: 0,
                    hqSaleVelocity: 1,
                    entries: [],
                    expiry: 0,
                },
            };
        }
        const itemHistory = this.itemHistoryResponse.items[id];

        const shopPrice = getShopPrice(item, this.gilShopIds);
        const marketPriceDc = getDcPrice(itemHistory.entries);
        const marketPriceWorld = getWorldPrice(
            itemHistory.entries,
            currentWorld
        );
        const marketThroughputDc = getDcThroughput(itemHistory.entries);
        const marketThroughputWorld = getWorldThroughput(
            itemHistory.entries,
            currentWorld
        );
        let craftedPrices: CraftResult[] = this.getCraftedPrices(id);

        const priceResult: PriceResult = {
            item,
            name: item.Name,
            requiredAmount: 1,
            craftedPrices,
            marketPriceDc,
            marketPriceWorld,
            marketThroughputDc,
            marketThroughputWorld,
            dc: currentDc,
            world: currentWorld,
            shopPrice,
            nqSaleVelocity: itemHistory.nqSaleVelocity,
            hqSaleVelocity: itemHistory.hqSaleVelocity,
            history: itemHistory,
        };

        if (this.priceResultCache[currentDc] == null) {
            this.priceResultCache[currentDc] = {};
        }

        this.priceResultCache[currentDc][id] = priceResult;

        return priceResult;
    }

    private getCraftedPrices(id: number): CraftResult[] {
        if (id in this.recipeCache) {
            const itemRecipes = this.recipeCache[id].recipes;
            const jobIds = Object.keys(itemRecipes);
            const craftResults: CraftResult[] = [];
            for (const jobId of jobIds) {
                const jobRecipe = itemRecipes[+jobId];
                const componentItems: Ingredient[] =
                    jobRecipe.Ingredients.concat(jobRecipe.Crystals);
                const components: PriceResult[] = componentItems.map((x) => {
                    const priceResult = { ...this.getPriceForItem(x.itemId) };
                    priceResult.requiredAmount = x.amount;
                    return priceResult;
                });
                craftResults.push({
                    price: components
                        .map((x) => getLowestPrice(x) * x.requiredAmount)
                        .reduce((partialSum, a) => partialSum + a, 0),
                    components: components.map((x) => x),
                    amount: jobRecipe.Amount,
                });
            }

            return craftResults;
        }
        return [];
    }
}

function getShopPrice(item: Item, gilShopIds: number[]): number {
    return gilShopIds.includes(item.id)
        ? item.Price_Mid_
        : Number.MAX_SAFE_INTEGER;
}

function getWorldThroughput(
    entries: ItemHistoryEntry[],
    worldName: string
): number {
    return getMarketThroughput(entries.filter((x) => x.worldName == worldName));
}

function getDcThroughput(entries: ItemHistoryEntry[]): number {
    return getMarketThroughput(entries);
}

function getMarketThroughput(entries: ItemHistoryEntry[]): number {
    return entries.reduce(
        (sum, entry) => sum + entry.quantity * entry.pricePerUnit,
        0
    );
}

function getWorldPrice(entries: ItemHistoryEntry[], worldName: string): number {
    return getMarketPrice(entries.filter((x) => x.worldName == worldName));
}

function getDcPrice(entries: ItemHistoryEntry[]): number {
    return getMarketPrice(entries);
}

function getMarketPrice(entries: ItemHistoryEntry[]): number {
    return getMarketPriceMedian(entries);
}

function getMarketPriceMedian(entries: ItemHistoryEntry[]): number {
    if (entries.length === 0) {
        return -1;
    }

    const prices: number[] = [];
    for (const entry of entries) {
        prices.push(...new Array(entry.quantity).fill(entry.pricePerUnit));
    }

    prices.sort();

    const half = Math.floor(prices.length / 2);

    return prices.length % 2
        ? prices[half] // odd items
        : (prices[half - 1] + prices[half]) / 2; // even items
}

function getMarketPriceMean(entries: ItemHistoryEntry[]): number {
    if (entries.length === 0) {
        return -1;
    }

    let totalQuantity = 0;
    let totalPrice = 0;
    for (const entry of entries) {
        totalQuantity += entry.quantity;
        totalPrice += entry.quantity * entry.pricePerUnit;
    }

    return totalPrice / totalQuantity;
}

function getLowestPrice(result: PriceResult): number {
    return Math.min(
        ...result.craftedPrices.map((x) => x.price / x.amount),
        result.marketPriceDc ?? Number.MAX_SAFE_INTEGER,
        result.shopPrice ?? Number.MAX_SAFE_INTEGER
    );
}
