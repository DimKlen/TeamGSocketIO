import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecapVoteStepComponent } from './recap-vote-step.component';

describe('RecapVoteStepComponent', () => {
  let component: RecapVoteStepComponent;
  let fixture: ComponentFixture<RecapVoteStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecapVoteStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecapVoteStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
