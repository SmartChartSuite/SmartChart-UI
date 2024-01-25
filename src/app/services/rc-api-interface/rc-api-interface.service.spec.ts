import { TestBed } from '@angular/core/testing';

import { RcApiInterfaceService } from './rc-api-interface.service';

describe('RcApiInterfaceService', () => {
  let service: RcApiInterfaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RcApiInterfaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
