import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../db';

@Pipe({
    name: 'order',
    standalone: true
})
export class OrderPipe implements PipeTransform {

    transform(items: Item[] | null, change: boolean): Item[] {
        if (items === null) {
            return [];
        }

        return [...items].sort((a, b) => (+b.selected) - (+a.selected) || a.name.localeCompare(b.name))
    }
}