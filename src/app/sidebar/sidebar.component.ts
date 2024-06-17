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
import { OrderPipe } from '../pipes/order.pipe';

import { Item, db } from '../db';
import { liveQuery } from 'dexie';
import { Subscription } from 'rxjs';

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
        OrderPipe,
    ],
    providers: [FilterPipe, OrderPipe],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {

    public searchFilter: string = 'dia fen';
    public changeFlag: boolean = false;

    public items: Item[] = [];

    private items$ = liveQuery(() => db.items
        .toArray());

    private subscription: Subscription = new Subscription();

    constructor(
        private filterPipe: FilterPipe,
        private orderPipe: OrderPipe,
    ) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
    ngOnInit(): void {
        this.subscription.add(this.items$.subscribe(items => {
            this.setSelected(items, false);
        }));
    }

    private setSelected(items: Item[], selected: boolean): void {
        const initialisedItems = [...items];
        for (const item of initialisedItems) {
            item.selected = selected;
        }

        this.items = initialisedItems;
    }

    onSelect(item: Item): void {
        item.selected = !item.selected;
        this.changeFlag = !this.changeFlag;
    }

    selectFirst(): void {
        const orderedItems = this.orderPipe.transform(this.filterPipe.transform(this.items, this.searchFilter), false);
        for (const item of orderedItems) {
            if (!item.selected) {
                item.selected = true;
                this.changeFlag = !this.changeFlag;
                return;
            }
        }
    }

    deselectLast(): void {
        const orderedItems = this.orderPipe.transform(this.filterPipe.transform(this.items, this.searchFilter), false);
        let previousItem = null;
        for (const item of orderedItems) {
            if (!item.selected) {
                if (previousItem !== null) {
                    previousItem.selected = false;
                    this.changeFlag = !this.changeFlag;
                }
                return;
            }

            previousItem = item;
        }

        if (previousItem !== null) {
            previousItem.selected = false;
            this.changeFlag = !this.changeFlag;
        }
    }

    clearSelection(): void {
        this.setSelected(this.items, false);
    }

    calculate() {
        throw new Error('Method not implemented.');
    }
}
