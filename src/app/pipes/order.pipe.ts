import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { Item } from '../models/item.model';

@Pipe({
    name: 'order',
    standalone: true
})
export class OrderPipe implements PipeTransform {
    
    constructor(public language: LanguageService) {}

    transform(items: Item[] | null, change: boolean): Item[] {
        if (items === null) {
            return [];
        }

        return [...items].sort((a, b) => (+b.selected) - (+a.selected) || a[this.language.getCurrent()].localeCompare(b[this.language.getCurrent()]))
    }
}