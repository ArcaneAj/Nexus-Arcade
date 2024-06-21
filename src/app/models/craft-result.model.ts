import { PriceResult } from "./price-result.model";

export interface CraftResult {
    price: number,
    components: PriceResult[],
}