import { TestBed } from '@angular/core/testing';

import { UniversalisService } from './universalis.service';

describe('UniversalisService', () => {
    let service: UniversalisService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UniversalisService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
