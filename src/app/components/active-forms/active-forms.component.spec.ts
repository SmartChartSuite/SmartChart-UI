import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveChartsComponent } from './active-charts.component';

describe('ActiveChartsComponent', () => {
  let component: ActiveChartsComponent;
  let fixture: ComponentFixture<ActiveChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveChartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
