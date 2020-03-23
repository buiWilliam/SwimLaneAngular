import { TestBed } from '@angular/core/testing';

import { DiagramDataService } from './diagram-data.service';

describe('DiagramDataService', () => {
  let service: DiagramDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagramDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
