import { Injectable } from '@angular/core';
import { World } from '../models/world.model';
import { DataCenter } from '../models/datacenter.model';
import { db } from '../db';
import { Observable, Subject } from 'rxjs';
import { NamedObject } from '../models/named-object.model';
import * as dexie from 'dexie';
import { Setting, WorldSetting } from '../models/setting.model';

export const languages = {
    en: 'English',
    de: 'German',
    ja: 'Japanese',
    fr: 'French',
} as const;

export type Language = keyof typeof languages;

const DEFAULT_DATACENTER: DataCenter = {
    name: 'Materia',
    region: 'Oceania',
    worlds: [21, 22, 86, 87, 88],
};

const DEFAULT_WORLD: World = {
    id: 21,
    name: 'Ravana',
    dataCenter: DEFAULT_DATACENTER,
};

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private worldChangedSubject: Subject<World> = new Subject<World>();
    public worldChanged: Observable<World> =
        this.worldChangedSubject.asObservable();

    private currentLanguage: Language = 'en';
    private currentWorld: World = DEFAULT_WORLD;

    constructor() {}

    public getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    public setCurrentLanguage(language: Language): void {
        this.currentLanguage = language;
    }

    public getCurrentWorld(): World {
        return this.currentWorld;
    }

    public setCurrentWorld(world: World): void {
        this.currentWorld = world;
        const worldSetting: WorldSetting = {
            name: 'currentWorld',
            value: world,
        };
        db.upsertSetting(worldSetting);
        this.worldChangedSubject.next(world);
    }

    public async updateDefaults(items: Setting[]): Promise<void> {
        const oldSettings = await db.settings.toArray();

        const changedSettings: Setting[] = items.filter((x) => {
            const oldSetting = oldSettings.find((y) => y.name === x.name);
            if (oldSetting == undefined) {
                return true; // We will add this as a new setting
            }

            const oldSettingCast = oldSetting as Setting;

            if (oldSettingCast.value !== x.value) {
                return true; // We will update the existing setting
            }

            return false;
        });

        await db.upsertSettingBulk(changedSettings);
    }

    public Settings(): dexie.Observable<Setting[]> {
        return dexie.liveQuery(() => db.settings.toArray());
    }
}
