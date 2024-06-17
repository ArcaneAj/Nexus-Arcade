import { Injectable } from '@angular/core';

export const languages = {
    "en" : "English",
    "de" : "German",
    "ja" : "Japanese",
    "fr" : "French",
} as const;

export type Language = keyof typeof languages;

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private currentLanguage: Language = 'en';
    constructor() { }

    public getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    public setCurrentLanguage(language: Language) {
        this.currentLanguage = language;
    }
}
