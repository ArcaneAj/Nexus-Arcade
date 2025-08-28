import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(private http: HttpClient) {}

    public get<T>(
        route: string,
        requestOptions?: {
            headers: HttpHeaders;
        }
    ): Observable<T> {
        return this.http.get<T>(route, requestOptions);
    }

    public getText(route: string): Observable<string> {
        return this.http.get(route, { responseType: 'text' });
    }

    public post<T>(
        route: string,
        body: any,
        requestOptions?: {
            headers: HttpHeaders;
        }
    ): Observable<T> {
        console.log({ requestOptions });
        return this.http.post<T>(route, body, requestOptions);
    }
}
