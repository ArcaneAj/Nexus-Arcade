import { Injectable } from '@angular/core';
import { World } from '../models/world.model';
import { DataCenter } from '../models/datacenter.model';
import { StorageService } from './storage.service';
import { db } from '../db';

export const languages = {
    "en" : "English",
    "de" : "German",
    "ja" : "Japanese",
    "fr" : "French",
} as const;

export type Language = keyof typeof languages;

const DEFAULT_WORLD: World = {
    id: 21,
    name: 'Ravana'
};

const DEFAULT_DATACENTER: DataCenter = {
    name: 'Materia',
    region: 'Oceania',
    worlds: [21, 22, 86, 87, 88]
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private currentLanguage: Language = 'en';
    private currentWorld: World = DEFAULT_WORLD;
    private currentDataCenter: DataCenter = DEFAULT_DATACENTER;

    constructor() { }

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
        db.upsertSetting('currentWorld', world);
    }
}
