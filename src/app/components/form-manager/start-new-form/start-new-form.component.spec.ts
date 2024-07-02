import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartNewFormComponent } from './start-new-form.component';

describe('NewChartComponent', () => {
  let component: StartNewFormComponent;
  let fixture: ComponentFixture<StartNewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartNewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
