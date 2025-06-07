import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowInGameStatsComponent } from './show-in-game-stats.component';

describe('ShowInGameStatsComponent', () => {
  let component: ShowInGameStatsComponent;
  let fixture: ComponentFixture<ShowInGameStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowInGameStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowInGameStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
