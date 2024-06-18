import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { Item } from '../models/item.model';

@Pipe({
    name: 'order',
    standalone: true
})
export class OrderPipe implements PipeTransform {
    
    constructor(public settings: SettingsService) {}

    transform(items: Item[] | null, change: boolean): Item[] {
        if (items === null) {
            return [];
        }

        return [...items].sort((a, b) => (+(!!b.selected)) - (+(!!a.selected)) || a.Name.localeCompare(b.Name))
    }
}