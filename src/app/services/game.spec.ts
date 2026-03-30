import { TestBed } from '@angular/core/testing';

import { GameService as Game } from './game';

import { testProviders } from 'src/test-utils/firebase-test.providers';
describe('Game', () => {
  let service: Game;

  beforeEach(() => {
    TestBed.configureTestingModule({
     providers: testProviders
    });
    service = TestBed.inject(Game);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
