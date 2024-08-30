import Dexie, { Table } from 'dexie';
import { DataCenter } from './models/datacenter.model';
import { World } from './models/world.model';
import { Item } from './models/item.model';
import { NamedObject } from './models/named-object.model';
import { ItemRecipe } from './models/item-recipe.model';
import { Setting } from './models/setting.model';

export class AppDB extends Dexie {
    items!: Table<Item, string>;
    marketableItems!: Table<Item, string>;
    dataCenters!: Table<DataCenter, string>;
    worlds!: Table<World, number>;
    settings!: Table<Setting, string>;
    recipes!: Table<ItemRecipe, number>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(4).stores({
            items: 'id',
            marketableItems: 'id',
            dataCenters: 'name',
            worlds: 'id',
            settings: 'name',
            recipes: 'id',
        });
    }

    public async populateItemNames(itemsToAdd: Item[]) {
        await db.items.bulkPut(itemsToAdd);
    }

    public async populateMarketableItemNames(itemsToAdd: Item[]) {
        await db.marketableItems.bulkPut(itemsToAdd);
    }

    public async populateDataCenters(dataCenters: DataCenter[]) {
        await db.dataCenters.bulkPut(dataCenters);
    }

    public async populateWorlds(worlds: World[]) {
        await db.worlds.bulkPut(worlds);
    }

    public async populateRecipes(recipes: ItemRecipe[]) {
        await db.recipes.bulkPut(recipes);
    }

    public async upsertSetting(setting: Setting) {
        await db.settings.put(setting);
    }

    public async upsertSettingBulk(items: Setting[]) {
        await db.settings.bulkPut(items);
    }
}

export const db = new AppDB();
