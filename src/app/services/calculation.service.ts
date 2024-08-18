import { Injectable } from '@angular/core';
import { PriceResult } from '../models/price-result.model';
import { ItemRecipe } from '../models/item-recipe.model';
import { ItemsHistoryResponse } from '../models/items-history-response.model';
import { Item } from '../models/item.model';
import { CraftResult } from '../models/craft-result.model';
import { Ingredient } from '../models/ingredient.model';
import { ItemHistoryEntry } from '../models/item-history-entry.model';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CalculationService {
    private priceResultsSubject: Subject<PriceResult[]> = new Subject<PriceResult[]>();
    public priceResults: Observable<PriceResult[]> = this.priceResultsSubject.asObservable();

    private priceResultCache: { [id: number] : PriceResult; };
    private recipeCache: { [id: number] : ItemRecipe; } = {};
    private itemCache: { [id: number] : Item; } = {};
    private itemHistoryResponse!: ItemsHistoryResponse;
    private gilShopIds: number[] = [];

    constructor() {
        this.priceResultCache = {};
    }

    public getPriceSkeleton(
        rootIds: number[],
        items: Item[]
    ): void {
        const itemDict = items.toDict(x => x.id); 
        this.priceResultsSubject.next(rootIds.map(id => {
            const item = itemDict[id];
            const priceResult: PriceResult = {
                item: item,
                name: item.Name,
                requiredAmount: 1,
                craftedPrices: [
                    {
                        price: Number.MAX_SAFE_INTEGER,
                        components: []
                    }
                ],
                shopPrice: Number.MAX_SAFE_INTEGER
            };
            return priceResult;
        }));
    }

    public calculatePrices(
        rootIds: number[],
        recipeCache: { [id: number] : ItemRecipe; },
        itemHistoryResponse: ItemsHistoryResponse,
        items: Item[],
        gilShopIds: number[],
    ): void {
        this.recipeCache = Object.assign({}, this.recipeCache, recipeCache);
        this.itemCache = items.toDict(x => x.id);
        this.itemHistoryResponse = itemHistoryResponse;
        this.gilShopIds = gilShopIds.unique().sort();
        this.priceResultsSubject.next(rootIds.map(x => this.getPriceForItem(x)));
    }

    private getPriceForItem(
        id: number
    ): PriceResult {
        if (id in this.priceResultCache) {
            return this.priceResultCache[id];
        }

        const item = this.itemCache[id];

        const shopPrice = getShopPrice(item, this.gilShopIds);
        const marketPrice = getMarketPrice(this.itemHistoryResponse.items[id].entries);
        let craftedPrices: CraftResult[] = this.getCraftedPrices(id);

        const priceResult: PriceResult = {
            item: item,
            name: item.Name,
            requiredAmount: 1,
            craftedPrices,
            marketPrice,
            shopPrice
        };

        this.priceResultCache[id] = priceResult;
        
        return priceResult;
    }

    private getCraftedPrices(id: number,): CraftResult[] {
        if (id in this.recipeCache) {
            const itemRecipes = this.recipeCache[id].recipes;
            const jobIds = Object.keys(itemRecipes);
            const craftResults: CraftResult[] = [];
            for (const jobId of jobIds) {
                const componentItems: Ingredient[] = itemRecipes[+jobId].Ingredients.concat(itemRecipes[+jobId].Crystals);
                const components: PriceResult[] = componentItems.map(x =>  {
                    const priceResult = {...this.getPriceForItem(x.itemId)};
                    priceResult.requiredAmount = x.amount;
                    return priceResult;
                });
                craftResults.push({
                    price: components.map(x => getLowestPrice(x) * x.requiredAmount).reduce((partialSum, a) => partialSum + a, 0),
                    components: components.map(x => x),
                })
            }

            return craftResults;
        }
        return [];
    }
}

function getShopPrice(
    item: Item,
    gilShopIds: number[]
): number {
    return gilShopIds.includes(item.id) ? item.Price_Mid_ : Number.MAX_SAFE_INTEGER;
}

function getMarketPrice(entries: ItemHistoryEntry[]): number {
    if (entries.length === 0) {
        return 0;
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
    return Math.min(...result.craftedPrices.map(x => x.price), result.marketPrice ?? Number.MAX_SAFE_INTEGER, result.shopPrice ?? Number.MAX_SAFE_INTEGER);
}