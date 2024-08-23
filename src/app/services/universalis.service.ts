import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, forkJoin, map, of } from 'rxjs';
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

    private cache: { [dataCenter: string] : { [id: string] : ItemHistoryResponse; }; };
    constructor(private httpService: HttpService) {
        this.cache = {};
    }

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

        const cachedHistoryResponse: ItemsHistoryResponse = {
            itemIDs: [],
            dcName: dataCenter.name,
            unresolvedItems: [],
            items: {}
        };
        
        const indicesToRemove: number[] = [];
        for (const id of itemIds) {
            var item = this.getFromCache(dataCenter.name, id.toString())
            if (item != null) {
                cachedHistoryResponse.items[id.toString()] = item;
                cachedHistoryResponse.itemIDs.push(id);
                const index = itemIds.indexOf(id, 0);
                if (index > -1) {
                    indicesToRemove.push(index);
                }
            }
        }

        for (const index of [...indicesToRemove].reverse()) {
            itemIds.splice(index, 1);
        }


        if (itemIds.length === 0) {
            return of(cachedHistoryResponse);
        }
        
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
                const url = [HISTORY_URL, dataCenter.name, idChunk.join()].join('/');
                return this.httpService.get<ItemsHistoryResponse>(url);
            })).pipe(map(responses => {
                const itemsHistoryResponse: ItemsHistoryResponse = {
                    itemIDs: [],
                    dcName: dataCenter.name,
                    unresolvedItems: [],
                    items: {}
                };

                for (const response of responses) {
                    itemsHistoryResponse.itemIDs.push(...response.itemIDs);
                    itemsHistoryResponse.unresolvedItems.push(...response.unresolvedItems);
                    itemsHistoryResponse.items = {...response.items, ...itemsHistoryResponse.items};
                }
                for (const key in itemsHistoryResponse.items) {
                    this.addToCache(itemsHistoryResponse.items[key], dataCenter.name, key);
                }

                itemsHistoryResponse.itemIDs.push(...cachedHistoryResponse.itemIDs);
                itemsHistoryResponse.items = {...cachedHistoryResponse.items, ...itemsHistoryResponse.items};

                return itemsHistoryResponse;
            }));
        }

        const singleUrl = [HISTORY_URL, dataCenter.name, itemIds[0]].join('/');
        return this.httpService.get<ItemHistoryResponse>(singleUrl).pipe(map(x => {
            const response: ItemsHistoryResponse = {
                itemIDs: itemIds,
                dcName: dataCenter.name,
                unresolvedItems: [],
                items: {}
            }

            response.items[itemIds[0].toString()] = x
            response.itemIDs.push(...cachedHistoryResponse.itemIDs);
            response.items = {...cachedHistoryResponse.items, ...response.items};
            return response;
        }));
    }

    addToCache(item: ItemHistoryResponse, dataCentre: string, key: string) {
        item.expiry = addMinutes(new Date(), 30);
        if (!(dataCentre in this.cache)) {
            this.cache[dataCentre] = {};
        }
        this.cache[dataCentre][key] = item;
    }

    getFromCache(dataCentre: string, key: string): ItemHistoryResponse | undefined {
        if (dataCentre in this.cache && key in this.cache[dataCentre]) {
            const item = this.cache[dataCentre][key];
            if (item.expiry > new Date()) {
                return item;
            }
        }

        return undefined;
    }

    public purgeCache() {
        this.cache = {};
    }
}

function addMinutes(date: Date, minutes: number) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
