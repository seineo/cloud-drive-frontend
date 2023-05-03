import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpDownLoadComponent } from './up-down-load.component';

describe('UpDownLoadComponent', () => {
  let component: UpDownLoadComponent;
  let fixture: ComponentFixture<UpDownLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpDownLoadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpDownLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
