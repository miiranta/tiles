import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading', () => {
    service.show('Test message');
    expect(service.isLoading()).toBe(true);
  });

  it('should hide loading', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should update message', () => {
    const testMessage = 'Test loading message';
    let emittedMessage = '';
    
    service.message$.subscribe(message => {
      emittedMessage = message;
    });
    
    service.setMessage(testMessage);
    expect(emittedMessage).toBe(testMessage);
  });
});
