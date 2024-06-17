import Dexie, { Table } from 'dexie';
import { DataCenter } from './models/datacenter.model';
import { World } from './models/world.model';
import { Item } from './models/item.model';
import { NamedObject } from './models/named-object.model';


export class AppDB extends Dexie {
    items!: Table<Item, string>;
    dataCenters!: Table<DataCenter, string>;
    worlds!: Table<World, number>;
    settings!: Table<NamedObject, string>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(3).stores({
            items: 'id',
            dataCenters: 'name',
            worlds: 'id',
            settings: '',
        });
    }

    public async populateItemNames(itemsToAdd: Item[]) {
        await db.items.bulkPut(itemsToAdd);
    }

    public async populateDataCenters(dataCenters: DataCenter[]) {
        await db.dataCenters.bulkPut(dataCenters);
    }

    public async populateWorlds(worlds: World[]) {
        await db.worlds.bulkPut(worlds);
    }

    public async upsertSetting(name: string, setting: any) {
        await db.settings.put(setting, name);
    }
}

export const db = new AppDB();