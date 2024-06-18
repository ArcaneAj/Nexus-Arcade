import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, map } from 'rxjs';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';
import { ItemsHistoryResponse } from '../models/items-history-response.model';
import { ItemHistoryResponse } from '../models/item-history-response.model';

const MARKETABLE_URL = 'https://universalis.app/api/v2/marketable'
const DC_URL = 'https://universalis.app/api/v2/data-centers'
const WORLD_URL = 'https://universalis.app/api/v2/worlds'
const HISTORY_URL = 'https://universalis.app/api/v2/history'

@Injectable({
    providedIn: 'root'
})
export class UniversalisService {

    constructor(private httpService: HttpService) { }

    public marketable(): Observable<number[]> {
        return this.httpService.get<number[]>(MARKETABLE_URL)
    }

    public dataCenters(): Observable<DataCenter[]> {
        return this.httpService.get<DataCenter[]>(DC_URL)
    }

    public worlds(): Observable<World[]> {
        return this.httpService.get<World[]>(WORLD_URL)
    }

    public history(itemIds: number[], dataCenter: DataCenter): Observable<ItemsHistoryResponse> {
        const url = [HISTORY_URL, dataCenter.name, itemIds.join()].join('/')
        if (itemIds.length > 1) {
            return this.httpService.get<ItemsHistoryResponse>(url);
        }

        return this.httpService.get<ItemHistoryResponse>(url).pipe(map(x => {
            const response: ItemsHistoryResponse = {
                itemIds: itemIds,
                dcName: dataCenter.name,
                unresolvedItems: [],
                items: {}
            }
            response.items[itemIds[0].toString()] = x
            return response;
        }));
    }
}
