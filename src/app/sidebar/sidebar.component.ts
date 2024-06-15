import { Component, OnDestroy, OnInit } from '@angular/core';
// Core
import { CommonModule } from '@angular/common';
// Angular material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';
// Custom components
import { FilterPipe } from '../pipes/filter.pipe';
// Services
import { UniversalisService } from '../services/universalis.service';
import { TeamcraftService } from '../services/teamcraft.service';
import { LanguageService } from '../services/language.service';

import { Subscription, forkJoin } from 'rxjs';
import { Item, db } from '../db';
import { liveQuery } from 'dexie';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        // Core
        CommonModule,
        // Angular material
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        ScrollingModule,
        // Custom components
        FilterPipe,
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
    
    private subscription: Subscription = new Subscription();

    public searchFilter: string = 'dia fen';

    public items$ = liveQuery(() => db.items
            .toArray());

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
            for (const key in response.names) {
                const value = response.names[key];
                items.push({
                    id: key,
                    name: value[this.language.getCurrent()]
                })
            }

            console.log(items);
            await db.populate(items);
        }));
    }
    
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
    }
}
