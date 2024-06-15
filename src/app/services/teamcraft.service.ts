import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

const ITEMS_URL = 'https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/master/libs/data/src/lib/json/items.json';

type NameData = {
    en: string,
    de: string,
    ja: string,
    fr: string,
}

type NameResponse = { [id: string] : NameData; }

@Injectable({
    providedIn: 'root'
})
export class TeamcraftService {

    constructor(private httpService: HttpService) { }

    public names(): Observable<NameResponse> {
        return this.httpService.get<NameResponse>(ITEMS_URL)
    }
}
