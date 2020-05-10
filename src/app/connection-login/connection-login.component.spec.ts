import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionLoginComponent } from './connection-login.component';

describe('ConnectionLoginComponent', () => {
  let component: ConnectionLoginComponent;
  let fixture: ComponentFixture<ConnectionLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
