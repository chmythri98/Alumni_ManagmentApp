import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEventAlumniComponent } from './update-event-alumni.component';

describe('UpdateEventAlumniComponent', () => {
  let component: UpdateEventAlumniComponent;
  let fixture: ComponentFixture<UpdateEventAlumniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEventAlumniComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateEventAlumniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
