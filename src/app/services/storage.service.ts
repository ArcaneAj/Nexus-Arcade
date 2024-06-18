import { Injectable } from '@angular/core';
import { db } from '../db';
import { UniversalisService } from './universalis.service';
import { forkJoin, Subscription } from 'rxjs';
import { SettingsService } from './settings.service';
import { liveQuery, Observable } from 'dexie';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';
import { Item } from '../models/item.model';
import { NamedObject } from '../models/named-object.model';
import { XivApiService } from './xivapi.service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private subscription: Subscription = new Subscription();
    
    constructor(
        private universalis: UniversalisService,
        private xivApi: XivApiService,
        private settings: SettingsService
    ) {
    }

    public Items(): Observable<Item[]> {
        return liveQuery(() => db.items.toArray());
    }

    public MarketableItems(): Observable<Item[]> {
        return liveQuery(() => db.marketableItems.toArray());
    }

    public DataCenters(): Observable<DataCenter[]> {
        return liveQuery(() => db.dataCenters.toArray());
    }

    public Worlds(): Observable<World[]> {
        return liveQuery(() => db.worlds.toArray());
    }

    public async FetchSettings(): Promise<void> {
        const currentWorld: NamedObject | undefined = await db.settings.get('currentWorld');
        if (currentWorld != null) {
            this.settings.setCurrentWorld(currentWorld as World);
        }
    }

    public purge() {
        db.delete({disableAutoOpen: false}).then(() => this.populateCaches());
    }

    public populateCaches() {
        this.subscription.add(this.Worlds().subscribe(x => {
            if (x == null || x.length === 0) {
                this.updateWorldCache();
            }
        }));
        this.subscription.add(this.Items().subscribe(x => {
            if (x == null || x.length === 0) {
                this.updateItemNameCache();
            }
        }));
    }
    
    private updateItemNameCache() {
        const observable = forkJoin({
            items: this.xivApi.items(),
            marketable: this.universalis.marketable()
          });
        this.subscription.add(observable.subscribe(async response => {
            const start = Date.now();
            const items: Item[] = response.items.filter(i => !!i.Name);
            const marketableItems: Item[] = response.marketable.map(i => response.items[i]).filter(i => !!i.Name);
            console.log(Date.now() - start);
            
            await db.populateMarketableItemNames(marketableItems);
            await db.populateItemNames(items);
        }));
    }
    
    private updateWorldCache() {
        const observable = forkJoin({
            worlds: this.universalis.worlds(),
            dataCenters: this.universalis.dataCenters()
        });
        this.subscription.add(observable.subscribe(async response =>
            {
                for (const datacenter of response.dataCenters) {
                    for (const worldId of datacenter.worlds) {
                        const world = response.worlds.find(x => x.id === worldId);
                        if (world == null) {
                            continue;
                        }

                        world.dataCenter = datacenter;
                    }
                }

                db.populateWorlds(response.worlds);
                db.populateDataCenters(response.dataCenters);
            }
        ));
    }
}
