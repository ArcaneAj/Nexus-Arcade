import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

const MARKETABLE_URL = 'https://universalis.app/api/v2/marketable'

@Injectable({
    providedIn: 'root'
})
export class UniversalisService {

    constructor(private httpService: HttpService) { }

    public marketable(): Observable<number[]> {
        return this.httpService.get<number[]>(MARKETABLE_URL)
    }

}
