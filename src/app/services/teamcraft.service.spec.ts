import { TestBed } from '@angular/core/testing';

import { TeamcraftService } from './teamcraft.service';

describe('TeamcraftService', () => {
    let service: TeamcraftService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TeamcraftService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
