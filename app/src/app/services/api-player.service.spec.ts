import { TestBed } from '@angular/core/testing';

import { ApiPlayerService } from './api-player.service';

describe('ApiPlayerService', () => {
  let service: ApiPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
