import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowStatsComponent } from './show-stats.component';

describe('ShowStatsComponent', () => {
  let component: ShowStatsComponent;
  let fixture: ComponentFixture<ShowStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
