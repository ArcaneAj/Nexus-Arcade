import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, forkJoin, map } from 'rxjs';
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
        if (itemIds.length > 1) {
            const chunkedIds: number[][] = itemIds.reduce((resultArray: number[][], item, index) => { 
                const chunkIndex = Math.floor(index/100)
              
                if(!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [] // start a new chunk
                }
              
                resultArray[chunkIndex].push(item)
              
                return resultArray
            }, []);

            return forkJoin(chunkedIds.map(idChunk => {
                const url = [HISTORY_URL, dataCenter.name, idChunk.join()].join('/')
                return this.httpService.get<ItemsHistoryResponse>(url);
            })).pipe(map(responses => {
                const itemHistoryResponse: ItemsHistoryResponse = {
                    itemIDs: [],
                    dcName: dataCenter.name,
                    unresolvedItems: [],
                    items: {}
                };

                for (const response of responses) {
                    itemHistoryResponse.itemIDs.push(...response.itemIDs);
                    itemHistoryResponse.unresolvedItems.push(...response.unresolvedItems);
                    itemHistoryResponse.items = {...response.items, ...itemHistoryResponse.items};
                }

                return itemHistoryResponse;
            }));
        }

        const singleUrl = [HISTORY_URL, dataCenter.name, itemIds[0]].join('/')
        return this.httpService.get<ItemHistoryResponse>(singleUrl).pipe(map(x => {
            const response: ItemsHistoryResponse = {
                itemIDs: itemIds,
                dcName: dataCenter.name,
                unresolvedItems: [],
                items: {}
            }
            response.items[itemIds[0].toString()] = x
            return response;
        }));
    }
}
