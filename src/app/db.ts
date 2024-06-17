import Dexie, { Table } from 'dexie';
import { DataCenter } from './models/datacenter.model';
import { World } from './models/world.model';
import { Item } from './models/item.model';


export class AppDB extends Dexie {
    items!: Table<Item, string>;
    dataCenters!: Table<DataCenter, string>;
    worlds!: Table<World, number>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(3).stores({
            items: 'id',
            dataCenters: 'name',
            worlds: 'id'
        });
    }

    public async populateItemNames(itemsToAdd: Item[]) {
        await db.items.bulkAdd(itemsToAdd);
    }

    public async populateDataCenters(dataCenters: DataCenter[]) {
        await db.dataCenters.bulkAdd(dataCenters);
    }

    public async populateWorlds(worlds: World[]) {
        await db.worlds.bulkAdd(worlds);
    }
}

export const db = new AppDB();