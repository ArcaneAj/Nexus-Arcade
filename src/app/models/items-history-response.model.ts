import { ItemHistoryResponse } from './item-history-response.model';

export interface ItemsHistoryResponse {
    itemIDs: number[];
    items: { [id: string]: ItemHistoryResponse };
    dcName: string;
    unresolvedItems: number[];
}
