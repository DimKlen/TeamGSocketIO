import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarUserConnectedComponent } from './side-bar-user-connected.component';

describe('SideBarUserConnectedComponent', () => {
  let component: SideBarUserConnectedComponent;
  let fixture: ComponentFixture<SideBarUserConnectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideBarUserConnectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideBarUserConnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
