import { ItemHistoryResponse } from "./item-history-response.model";

export interface ItemsHistoryResponse {
    itemIds: number[];
    items: { [id: string] : ItemHistoryResponse; }
    dcName: string;
    unresolvedItems: number[];
}