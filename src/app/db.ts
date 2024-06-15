import Dexie, { Table } from 'dexie';

export interface Item {
    id: string;
    name: string;
}

export interface TodoItem {
    id?: number;
    todoListId: number;
    title: string;
    done?: boolean;
}

export class AppDB extends Dexie {
    items!: Table<Item, number>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(3).stores({
            items: 'name',
        });
    }

    public async populate(itemsToAdd: Item[]) {
        await db.items.bulkAdd(itemsToAdd);
    }
}

export const db = new AppDB();