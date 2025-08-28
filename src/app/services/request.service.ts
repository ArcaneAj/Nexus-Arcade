import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { UserCraftRequest } from '../models/user-craft-request.model';
import { ItemCraftRequest } from '../models/item-craft-request.model';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';

const BASE_URL = 'https://nexusarcade.azurewebsites.net/api/';
const FUNC_HEADER = 'ELc8er5kDTySMtux1y9kN-XvEDbucspL5TzDNhRIga-GAzFuxhGlxA==';
const requestOptions = {
    headers: new HttpHeaders({ 'x-functions-key': FUNC_HEADER }),
};

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    constructor(private httpService: HttpService) {}

    public add(request: UserCraftRequest): Observable<ItemCraftRequest[]> {
        return this.httpService.post<ItemCraftRequest[]>(
            BASE_URL + 'Add',
            request,
            requestOptions
        );
    }

    public list(request: User): Observable<ItemCraftRequest[]> {
        return this.httpService.post<ItemCraftRequest[]>(
            BASE_URL + 'List',
            request,
            requestOptions
        );
    }
}
