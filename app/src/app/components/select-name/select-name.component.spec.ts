import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectNameComponent } from './select-name.component';

describe('SelectNameComponent', () => {
  let component: SelectNameComponent;
  let fixture: ComponentFixture<SelectNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
