import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitementDossierComponent } from './traitement-dossier.component';

describe('TraitementDossierComponent', () => {
  let component: TraitementDossierComponent;
  let fixture: ComponentFixture<TraitementDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraitementDossierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraitementDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
