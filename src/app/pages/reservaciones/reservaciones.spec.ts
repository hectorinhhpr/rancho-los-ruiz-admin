import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reservaciones } from './reservaciones';

describe('Reservaciones', () => {
  let component: Reservaciones;
  let fixture: ComponentFixture<Reservaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reservaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Reservaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
