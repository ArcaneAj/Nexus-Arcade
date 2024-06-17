import { Injectable } from '@angular/core';
import { db, Item } from '../db';
import { UniversalisService } from './universalis.service';
import { TeamcraftService } from './teamcraft.service';
import { forkJoin, Subscription } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private subscription: Subscription = new Subscription();
    
    constructor(
        private universalis: UniversalisService,
        private teamcraft: TeamcraftService,
        private language: LanguageService
    ) {
    }
    
    updateCache() {
        const observable = forkJoin({
            names: this.teamcraft.names(),
            marketable: this.universalis.marketable()
          })
        this.subscription.add(observable.subscribe(async response => {
            const items: Item[] = [];
            const lang = this.language.getCurrent();
            for (const key in response.names) {
                const value = response.names[key];
                if (value[lang] === null || value[lang] === '') {
                    continue;
                }

                items.push({
                    id: key,
                    name: value[lang]
                })
            }

            await db.populate(items);
        }));
    }
}
