import { ItemHistoryEntry } from './item-history-entry.model';

export interface ItemHistoryResponse {
    itemId: number;
    dcName: string;
    lastUploadTime: number;
    stackSizeHistogram: { [id: string]: number };
    stackSizeHistogramNQ: { [id: string]: number };
    stackSizeHistogramHQ: { [id: string]: number };
    regularSaleVelocity: number;
    nqSaleVelocity: number;
    hqSaleVelocity: number;
    entries: ItemHistoryEntry[];
    expiry: any;
}
