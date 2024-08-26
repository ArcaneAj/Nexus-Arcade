import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(private http: HttpClient) {}

    public get<T>(route: string): Observable<T> {
        return this.http.get<T>(route);
    }

    public getText(route: string): Observable<string> {
        return this.http.get(route, { responseType: 'text' });
    }
}
