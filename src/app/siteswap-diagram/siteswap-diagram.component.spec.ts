import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteswapDiagramComponent } from './siteswap-diagram.component';

describe('SiteswapDiagramComponent', () => {
  let component: SiteswapDiagramComponent;
  let fixture: ComponentFixture<SiteswapDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteswapDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteswapDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
