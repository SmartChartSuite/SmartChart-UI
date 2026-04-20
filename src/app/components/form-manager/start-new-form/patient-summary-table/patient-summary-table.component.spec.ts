import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSummaryTableComponent } from './patient-summary-table.component';

describe('PatientSummaryTableComponent', () => {
  let component: PatientSummaryTableComponent;
  let fixture: ComponentFixture<PatientSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PatientSummaryTableComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
