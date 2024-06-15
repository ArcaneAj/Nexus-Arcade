import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../db';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {

    transform(value: Item[] | null, filter: string): Item[] {
        if (value === null) {
            return [];
        }

        const prefixes = filter.split(/\s+/)

        const filtered = value.filter(i => {
            const words = i.name.split(/\s+/);
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