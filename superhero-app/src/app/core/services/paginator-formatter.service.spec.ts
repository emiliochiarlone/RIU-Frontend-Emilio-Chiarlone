import { TestBed } from '@angular/core/testing';

import { PaginatorFormatterService } from './paginator-formatter.service';

describe('PaginatorFormatterService', () => {
  let service: PaginatorFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginatorFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
