import { TestBed } from '@angular/core/testing';

import { XivApiService } from './xivapi.service';

describe('XivapiService', () => {
    let service: XivApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(XivApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
