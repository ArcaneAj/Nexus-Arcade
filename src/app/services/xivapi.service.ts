import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, map } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { Item } from '../models/item.model';

const ITEMS_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/Item.csv';

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

function parseItem(properties: string[], types: string[], values: string[]) {
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