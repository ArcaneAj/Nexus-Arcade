import { PriceResult } from "./price-result.model";

export interface CraftResult {
    price: number,
    components: PriceResult[],
    amount: number,
}


    
export function getProfit(buyPrice?: number, sellPrice?: number): number | undefined {
    if (sellPrice == null || buyPrice == null) {
        return undefined;
    }

    if (sellPrice! <= buyPrice!) {
        return undefined;
    }

    return Math.round(sellPrice! - buyPrice!);
}