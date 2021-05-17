import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LadderDiagramComponent } from './ladder-diagram.component';

describe('LadderDiagramComponent', () => {
  let component: LadderDiagramComponent;
  let fixture: ComponentFixture<LadderDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LadderDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LadderDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
