import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get player name', () => {
    const testName = 'John';
    service.setPlayerName(testName);
    expect(service.getPlayerName()).toBe(testName);
  });

  it('should clear player name', () => {
    service.setPlayerName('John');
    service.clearPlayerName();
    expect(service.getPlayerName()).toBe('');
  });
});
