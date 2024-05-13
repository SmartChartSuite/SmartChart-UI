import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnstructuredResultsDetailsComponent } from './unstructured-results-details.component';

describe('UnstructuredResultsDetailsComponent', () => {
  let component: UnstructuredResultsDetailsComponent;
  let fixture: ComponentFixture<UnstructuredResultsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnstructuredResultsDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnstructuredResultsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
