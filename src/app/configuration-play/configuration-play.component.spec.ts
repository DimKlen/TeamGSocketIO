import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPlayComponent } from './configuration-play.component';

describe('ConfigurationPlayComponent', () => {
  let component: ConfigurationPlayComponent;
  let fixture: ComponentFixture<ConfigurationPlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationPlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
