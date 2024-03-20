import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RcApiTestComponentComponent } from './rc-api-test-component.component';

describe('RcApiTestComponentComponent', () => {
  let component: RcApiTestComponentComponent;
  let fixture: ComponentFixture<RcApiTestComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RcApiTestComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RcApiTestComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
