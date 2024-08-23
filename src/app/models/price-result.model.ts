import { CraftResult } from "./craft-result.model";
import { Item } from "./item.model";

export interface PriceResult {
    item: Item,
    name: string,
    requiredAmount: number,
    marketPriceDc: number,
    marketPriceWorld: number,
    dc: string,
    world: string,
    shopPrice?: number,
    craftedPrices: CraftResult[],
    cheapestCraft?: CraftResult,
    shopProfit?: number,
    craftProfit?: number,
    nqSaleVelocity: number,
    hqSaleVelocity: number,
}