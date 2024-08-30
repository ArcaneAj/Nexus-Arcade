import { Injectable } from '@angular/core';
import { db } from '../db';
import { UniversalisService } from './universalis.service';
import { forkJoin, Subscription, throttleTime } from 'rxjs';
import { SettingsService } from './settings.service';
import { liveQuery, Observable } from 'dexie';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';
import { Item } from '../models/item.model';
import { NamedObject } from '../models/named-object.model';
import { XivApiService } from './xivapi.service';
import { ItemRecipe } from '../models/item-recipe.model';
import { ItemCacheUpdateRequest } from './loader.worker';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private subscription: Subscription = new Subscription();
    private worker: Worker = new Worker(
        new URL('./loader.worker', import.meta.url)
    );

    constructor(
        private universalis: UniversalisService,
        private xivApi: XivApiService,
        private settings: SettingsService
    ) {}

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

    public Recipes(): Observable<ItemRecipe[]> {
        return liveQuery(() => db.recipes.toArray());
    }

    public async FetchSettings(): Promise<void> {
        const currentWorld: NamedObject | undefined = await db.settings.get(
            'currentWorld'
        );
        if (currentWorld != null) {
            this.settings.setCurrentWorld(currentWorld as World);
        }
    }

    public purge() {
        db.delete({ disableAutoOpen: false }).then(() => this.populateCaches());
    }

    public async populateCaches() {
        if ((await db.worlds.count()) === 0) {
            this.updateWorldCache();
        }

        if ((await db.items.count()) === 0) {
            if (typeof Worker !== 'undefined') {
                this.updateItemCache();
                this.worker.onmessage = ({ data }) => {
                    console.log('Updated items');
                };
            } else {
                alert(
                    'Please use a browser that supports web workers for this website. Internet Explorer 9 and below are not supported!'
                );
            }
        }
    }

    private updateItemCache() {
        const observable = forkJoin({
            items: this.xivApi.items(),
            marketable: this.universalis.marketable(),
            recipes: this.xivApi.recipes(),
        });
        this.subscription.add(
            observable
                .pipe(throttleTime(1000))
                .subscribe(async (data: ItemCacheUpdateRequest) => {
                    this.worker.postMessage(data);
                })
        );
    }

    private updateWorldCache() {
        const observable = forkJoin({
            worlds: this.universalis.worlds(),
            dataCenters: this.universalis.dataCenters(),
        });
        this.subscription.add(
            observable.subscribe(async (response) => {
                for (const datacenter of response.dataCenters) {
                    for (const worldId of datacenter.worlds) {
                        const world = response.worlds.find(
                            (x) => x.id === worldId
                        );
                        if (world == null) {
                            continue;
                        }

                        world.dataCenter = datacenter;
                    }
                }

                await db.populateWorlds(response.worlds);
                await db.populateDataCenters(response.dataCenters);
            })
        );
    }
}
