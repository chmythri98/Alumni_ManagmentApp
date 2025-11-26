import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEventPageComponent } from './file-event-page.component';

describe('FileEventPageComponent', () => {
  let component: FileEventPageComponent;
  let fixture: ComponentFixture<FileEventPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileEventPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileEventPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
