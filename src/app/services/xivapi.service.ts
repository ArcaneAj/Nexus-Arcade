import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, map } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { Item } from '../models/item.model';
import { Recipe } from '../models/recipe.model';
import { CrafterJobs } from '../constants';

const ITEMS_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/Item.csv';
const RECIPE_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/Recipe.csv';
const SHOP_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/GilShopItem.csv'

interface XivApiItem {
    id: number,
    Singular: string,
    Adjective: number,
    Plural: string,
    PossessivePronoun: number,
    StartsWithVowel: number,
    Pronoun: number,
    Article: number,
    Description: string,
    Name: string,
    Icon: string,
    Level_Item_: string,
    Rarity: number,
    FilterGroup: number,
    AdditionalData: string,
    ItemUICategory: string,
    ItemSearchCategory: string,
    EquipSlotCategory: string,
    ItemSortCategory: string,
    StackSize: number,
    IsUnique: false,
    IsUntradable: false,
    IsIndisposable: false,
    Lot: false,
    Price_Mid_: number,
    Price_Low_: number,
    CanBeHq: false,
    IsDyeable: false,
    IsCrestWorthy: false,
    ItemAction: string,
    CastTime_s_: number,
    Cooldown_s_: number,
    ClassJob_Repair_: string,
    Item_Repair_: string,
    Item_Glamour_: string,
    Desynth: number,
    IsCollectable: false,
    AlwaysCollectable: false,
    AetherialReduce: number,
    Level_Equip_: number,
    RequiredPvpRank: number,
    EquipRestriction: number,
    ClassJobCategory: string,
    GrandCompany: string,
    ItemSeries: string,
    BaseParamModifier: number,
    Model_Main_: number[],
    Model_Sub_: number[],
    ClassJob_Use_: string,
    Damage_Phys_: number,
    Damage_Mag_: number,
    Delay_ms_: number,
    BlockRate: number,
    Block: number,
    Defense_Phys_: number,
    Defense_Mag_: number,
    BaseParam_0_: string,
    BaseParamValue_0_: number,
    BaseParam_1_: string,
    BaseParamValue_1_: number,
    BaseParam_2_: string,
    BaseParamValue_2_: number,
    BaseParam_3_: string,
    BaseParamValue_3_: number,
    BaseParam_4_: string,
    BaseParamValue_4_: number,
    BaseParam_5_: string,
    BaseParamValue_5_: number,
    ItemSpecialBonus: string,
    ItemSpecialBonus_Param_: number,
    BaseParam_Special__0_: string,
    BaseParamValue_Special__0_: number,
    BaseParam_Special__1_: string,
    BaseParamValue_Special__1_: number,
    BaseParam_Special__2_: string,
    BaseParamValue_Special__2_: number,
    BaseParam_Special__3_: string,
    BaseParamValue_Special__3_: number,
    BaseParam_Special__4_: string,
    BaseParamValue_Special__4_: number,
    BaseParam_Special__5_: string,
    BaseParamValue_Special__5_: number,
    MaterializeType: number,
    MateriaSlotCount: number,
    IsAdvancedMeldingPermitted: false,
    IsPvP: false,
    SubStatCategory: number,
    IsGlamourous: false
}

interface XivApiRecipe {
    id: number,
    Number: number,
    CraftType: string,
    RecipeLevelTable: string,
    Item_Result_: string,
    Amount_Result_: number,
    Item_Ingredient__0_: string,
    Amount_Ingredient__0_: number,
    Item_Ingredient__1_: string,
    Amount_Ingredient__1_: number,
    Item_Ingredient__2_: string,
    Amount_Ingredient__2_: number,
    Item_Ingredient__3_: string,
    Amount_Ingredient__3_: number,
    Item_Ingredient__4_: string,
    Amount_Ingredient__4_: number,
    Item_Ingredient__5_: string,
    Amount_Ingredient__5_: number,
    Item_Ingredient__6_: string,
    Amount_Ingredient__6_: number,
    Item_Ingredient__7_: string,
    Amount_Ingredient__7_: number,
    Item_Ingredient__8_: string,
    Amount_Ingredient__8_: number,
    Item_Ingredient__9_: string,
    Amount_Ingredient__9_: number,
    RecipeNotebookList: string,
    IsSecondary: false,
    MaterialQualityFactor: number,
    DifficultyFactor: number,
    QualityFactor: number,
    DurabilityFactor: number,
    RequiredQuality: number,
    RequiredCraftsmanship: number,
    RequiredControl: number,
    QuickSynthCraftsmanship: number,
    QuickSynthControl: number,
    SecretRecipeBook: string,
    Quest: string,
    CanQuickSynth: true,
    CanHq: true,
    ExpRewarded: true,
    Status_Required_: string,
    Item_Required_: string,
    IsSpecializationRequired: false,
    IsExpert: false,
    PatchNumber: number
}

@Injectable({
    providedIn: 'root'
})
export class XivApiService {

    constructor(
        private httpService: HttpService,
        private papa: Papa
    ) { }

    public items(): Observable<Item[]> {
        return this.httpService.getText(ITEMS_URL).pipe(map(x => {
            const parsed = this.papa.parse(x).data;
            const meta = parsed.slice(0, 3);
            const properties = meta[1];
            const types = meta[2];
            return parsed.slice(3) // Skip the meta rows
                         .map((itemRaw: string[]) => parseItem(properties, types, itemRaw));
        }));
    }

    public recipes(): Observable<Recipe[]> {
        return this.httpService.getText(RECIPE_URL).pipe(map(x => {
            const parsed = this.papa.parse(x).data;
            const meta = parsed.slice(0, 3);
            const properties = meta[1];
            const types = meta[2];
            return parsed.slice(3) // Skip the meta rows
                         .map((recipeRaw: string[]) => parseRecipe(properties, types, recipeRaw));
        }));
    }

    public gilShopItems(): Observable<number[]> {
        return this.httpService.getText(SHOP_URL).pipe(map(x => {
            const parsed: string[][] = this.papa.parse(x).data;
            const itemIdIndex = parsed[1].findIndex((x: string) => x === 'Item')
            return parsed.slice(3) // Skip the meta rows
                         .map((rawData: string[]) => +rawData[itemIdIndex])
                         .filter((value, index, array) => array.indexOf(value) === index); // Unique item ids
        }));
    }
}

const arrayTypes: string[] = [
    "int64",
]

const integralTypes: string[] = [
    "int16",
    "int32",
    "int64",
    "sbyte",
    "byte",
    "uint16",
    "uint32",
]
const booleanTypes: string[] = [
    "bit&01",
    "bit&02",
    "bit&04",
    "bit&08",
    "bit&10",
    "bit&20",
    "bit&40",
    "bit&80",
    "bit&01",
]

function parseItem(properties: string[], types: string[], values: string[]): Item {
    const merged = Array(properties.length);
    for (let i = 0; i < properties.length; i++) {
        const propertyname = properties[i] === '#' ? 'id' : properties[i].replace(/\W/gi, '_');
        merged.push([propertyname, parse(types[i], values[i])]);
    }
    const obj = Object.fromEntries(merged.filter(x => x[0] !== '')) as XivApiItem;
    const item: Item = {
        id: obj.id,
        Singular: obj.Singular,
        Plural: obj.Plural,
        Description: obj.Description,
        Name: obj.Name,
        Icon: obj.Icon,
        StackSize: obj.StackSize,
        Price_Mid_: obj.Price_Mid_, // Shop purchase price
        Price_Low_: obj.Price_Low_, // Shop sell price
    };
    return item;
}

function parseRecipe(properties: string[], types: string[], values: string[]): Recipe {
    const merged = Array(properties.length);
    for (let i = 0; i < properties.length; i++) {
        const propertyname = properties[i] === '#' ? 'id' : properties[i].replace(/\W/gi, '_');
        merged.push([propertyname, parse(types[i], values[i])]);
    }

    const obj = Object.fromEntries(merged.filter(x => x[0] !== '')) as XivApiRecipe;
    const recipe: Recipe = {
        id: obj.id,
        CraftJobId: +obj.CraftType,
        CraftJob: CrafterJobs[+obj.CraftType],
        RecipeLevel: +obj.RecipeLevelTable,
        ItemId: +obj.Item_Result_,
        Amount: obj.Amount_Result_,
        Ingredients: [
            {itemId: +obj.Item_Ingredient__0_, amount: obj.Amount_Ingredient__0_},
            {itemId: +obj.Item_Ingredient__1_, amount: obj.Amount_Ingredient__1_},
            {itemId: +obj.Item_Ingredient__2_, amount: obj.Amount_Ingredient__2_},
            {itemId: +obj.Item_Ingredient__3_, amount: obj.Amount_Ingredient__3_},
            {itemId: +obj.Item_Ingredient__4_, amount: obj.Amount_Ingredient__4_},
            {itemId: +obj.Item_Ingredient__5_, amount: obj.Amount_Ingredient__5_},
            {itemId: +obj.Item_Ingredient__6_, amount: obj.Amount_Ingredient__6_},
            {itemId: +obj.Item_Ingredient__7_, amount: obj.Amount_Ingredient__7_},
        ].filter(x => x.amount),
        Crystals: [
            {itemId: +obj.Item_Ingredient__8_, amount: obj.Amount_Ingredient__8_},
            {itemId: +obj.Item_Ingredient__9_, amount: obj.Amount_Ingredient__9_},
        ].filter(x => x.amount),
    };
    return recipe;
}

function isIntegral(typeName: string): boolean {
    return integralTypes.includes(typeName);
}

function isBoolean(typeName: string): boolean {
    return booleanTypes.includes(typeName);
}

function isArray(typeName: string): boolean {
    return arrayTypes.includes(typeName);
}

function parse(typeName: string, value: string): any {
    if (isArray(typeName) && value) {
        const split = value.split(',').map(x => x.trim())
        if (split[0] !== value) {
            return split.map(x => parse(typeName, x));
        }
    }

    if (isIntegral(typeName)) {
        return +value;
    }

    if (isBoolean(typeName)) {
        return value && value.toLowerCase() === "true"
    }

    return value;
}