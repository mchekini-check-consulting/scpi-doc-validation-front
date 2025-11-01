import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandHistoryComponent } from './demand-history.component';

describe('DemandHistoryComponent', () => {
  let component: DemandHistoryComponent;
  let fixture: ComponentFixture<DemandHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
