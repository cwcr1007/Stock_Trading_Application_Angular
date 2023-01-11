import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailGeneralComponent } from './detail-general.component';

describe('DetailGeneralComponent', () => {
  let component: DetailGeneralComponent;
  let fixture: ComponentFixture<DetailGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailGeneralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
