import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumniDataPageComponent } from './alumni-data-page.component';

describe('AlumniDataPageComponent', () => {
  let component: AlumniDataPageComponent;
  let fixture: ComponentFixture<AlumniDataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumniDataPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlumniDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
