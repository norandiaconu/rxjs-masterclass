import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservableStoreComponent } from './observable-store.component';

describe('ObservableStoreComponent', () => {
  let component: ObservableStoreComponent;
  let fixture: ComponentFixture<ObservableStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservableStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservableStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
