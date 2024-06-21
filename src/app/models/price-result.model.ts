import { CraftResult } from "./craft-result.model";
import { Item } from "./item.model";

export interface PriceResult {
    item: Item,
    name: string,
    requiredAmount: number,
    marketPrice?: number,
    shopPrice?: number,
    craftedPrices: CraftResult[],
}