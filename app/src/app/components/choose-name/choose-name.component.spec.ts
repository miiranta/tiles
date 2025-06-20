import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseNameComponent } from './choose-name.component';

describe('ChooseNameComponent', () => {
  let component: ChooseNameComponent;
  let fixture: ComponentFixture<ChooseNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
