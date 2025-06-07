import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectColorComponent } from './select-color.component';

describe('SelectColorComponent', () => {
  let component: SelectColorComponent;
  let fixture: ComponentFixture<SelectColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectColorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
