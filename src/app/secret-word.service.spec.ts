import { TestBed } from '@angular/core/testing';

import { SecretWordService } from './secret-word.service';

describe('SecretWordService', () => {
  let service: SecretWordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecretWordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
