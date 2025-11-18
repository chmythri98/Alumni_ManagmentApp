import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumniRequestsComponent } from './alumni-requests.component';

describe('AlumniRequestsComponent', () => {
  let component: AlumniRequestsComponent;
  let fixture: ComponentFixture<AlumniRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumniRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlumniRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
