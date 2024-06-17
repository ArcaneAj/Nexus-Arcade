import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { Item } from '../models/item.model';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {

    constructor(public settings: SettingsService) {}

    transform(value: Item[] | null, filter: string): Item[] {
        if (value === null) {
            return [];
        }

        const prefixes = filter.split(/\s+/)

        const filtered = value.filter(i => {
            if (i.selected) {
                return true;
            }
            
            const words = i[this.settings.getCurrentLanguage()].split(/\s+/);
            for (const prefix of prefixes) {
                if (!words.some(w => w.toLowerCase().startsWith(prefix.toLowerCase()))) {
                    return false;
                }
            }

            return true;
        });

        return filtered;
    }
}