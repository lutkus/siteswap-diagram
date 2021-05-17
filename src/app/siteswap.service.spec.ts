import { TestBed } from '@angular/core/testing';

import { SiteswapService } from './siteswap.service';

describe('SiteswapService', () => {
  let service: SiteswapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteswapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
