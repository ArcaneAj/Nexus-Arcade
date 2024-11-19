import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { UserCraftRequest } from '../models/user-craft-request.model';
import { ItemCraftRequest } from '../models/item-craft-request.model';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:30096/api/';

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    constructor(private httpService: HttpService) {}

    public add(request: UserCraftRequest): Observable<ItemCraftRequest[]> {
        return this.httpService.post<ItemCraftRequest[]>(
            BASE_URL + 'Add',
            request
        );
    }
}
