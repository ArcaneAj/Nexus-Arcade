import { Injectable } from '@angular/core';
import { db } from '../db';
import { UniversalisService } from './universalis.service';
import { TeamcraftService } from './teamcraft.service';
import { forkJoin, Subscription } from 'rxjs';
import { SettingsService } from './settings.service';
import { liveQuery, Observable } from 'dexie';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';
import { Item } from '../models/item.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private subscription: Subscription = new Subscription();
    
    constructor(
        private universalis: UniversalisService,
        private teamcraft: TeamcraftService,
        private settings: SettingsService
    ) {
    }

    public Items(): Observable<Item[]> {
        return liveQuery(() => db.items.toArray());
    }

    public DataCenters(): Observable<DataCenter[]> {
        return liveQuery(() => db.dataCenters.toArray());
    }

    public Worlds(): Observable<World[]> {
        return liveQuery(() => db.worlds.toArray());
    }
    
    updateItemNameCache() {
        const observable = forkJoin({
            names: this.teamcraft.names(),
            marketable: this.universalis.marketable()
          })
        this.subscription.add(observable.subscribe(async response => {
            const items: Item[] = [];
            const lang = this.settings.getCurrentLanguage();
            for (const key in response.names) {
                const value = response.names[key];
                if (value[lang] === null || value[lang] === '') {
                    continue;
                }

                items.push({
                    id: key,
                    selected: false,
                    en: value.en,
                    de: value.de,
                    ja: value.ja,
                    fr: value.fr,
                })
            }
            
            await db.populateItemNames(items);
        }));
    }
    
    updateDataCenterCache() {
        this.subscription.add(this.universalis.dataCenters().subscribe( async x => db.populateDataCenters(x)));
    }
    
    updateWorldCache() {
        this.subscription.add(this.universalis.worlds().subscribe( async x => db.populateWorlds(x)));
    }
}
