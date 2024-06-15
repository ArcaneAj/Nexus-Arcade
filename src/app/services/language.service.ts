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
export class LanguageService {

    private currentLanguage: Language = 'en';
    constructor() { }

    public getCurrent(): Language {
        return this.currentLanguage;
    }

    public setCurrent(language: Language) {
        this.currentLanguage = language;
    }
}
