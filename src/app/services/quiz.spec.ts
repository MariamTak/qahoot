import { TestBed } from '@angular/core/testing';

import { QuizService  } from './quiz';

import { testProviders } from 'src/test-utils/firebase-test.providers';
describe('QuizService', () => {
  let service: QuizService ;

  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: testProviders
    });
    service = TestBed.inject(QuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
