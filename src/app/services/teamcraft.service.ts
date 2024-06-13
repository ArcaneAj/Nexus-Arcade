import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

const ITEMS_URL = 'https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/master/libs/data/src/lib/json/items.json';

@Injectable({
    providedIn: 'root'
})
export class TeamcraftService {

    constructor(private httpService: HttpService) { }

    public names(): Observable<number[]> {
        return this.httpService.get<number[]>(ITEMS_URL)
    }
}
