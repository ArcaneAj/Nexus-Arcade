import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';

const MARKETABLE_URL = 'https://universalis.app/api/v2/marketable'
const DC_URL = 'https://universalis.app/api/v2/data-centers'
const WORLD_URL = 'https://universalis.app/api/v2/worlds'

@Injectable({
    providedIn: 'root'
})
export class UniversalisService {

    constructor(private httpService: HttpService) { }

    public marketable(): Observable<number[]> {
        return this.httpService.get<number[]>(MARKETABLE_URL)
    }

    public dataCenters(): Observable<DataCenter[]> {
        return this.httpService.get<DataCenter[]>(DC_URL)
    }

    public worlds(): Observable<World[]> {
        return this.httpService.get<World[]>(WORLD_URL)
    }
}
