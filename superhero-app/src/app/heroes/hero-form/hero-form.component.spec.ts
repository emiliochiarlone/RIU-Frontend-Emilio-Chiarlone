import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { HeroFormComponent } from './hero-form.component';
import { Hero } from '@core/models/hero.model';
import { HeroStore } from '@core/services/heroes/hero.store';
import { DialogService } from '@core/services/dialog.service';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

/**
 * @description Unit tests for the HeroFormComponent
 * @author @emiliochiarlone
 */
describe('HeroFormComponent', () => {
  let fixture: ComponentFixture<HeroFormComponent>;
  let component: HeroFormComponent;

  type HeroStoreInstance = InstanceType<typeof HeroStore>;
  let heroStoreSpy: jasmine.SpyObj<HeroStoreInstance>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: any;

  // helper to control dialog closing result
  let dialogResult$: Subject<boolean>;

  beforeEach(async () => {
    heroStoreSpy = jasmine.createSpyObj(
      'HeroStore',
      ['createHero', 'updateHero', 'getHeroById'],
      {
        isLoading: () => false,
        errorMessage: () => null,
        errorCode: () => null,
      }
    );
    heroStoreSpy.getHeroById.and.returnValue(() => null);

    dialogResult$ = new Subject<boolean>();
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
    dialogServiceSpy.openDialog.and.returnValue({
      afterClosed: () => dialogResult$.asObservable(),
    } as any);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        { provide: HeroStore, useValue: heroStoreSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in creation mode when no Id param', () => {
    expect(component.isCreationMode).toBeTrue();
  });

  it('should start in edit mode and load hero when id param exists', () => {
    const existing = new Hero('ExistingHero');
    existing.id = 5;
    heroStoreSpy.getHeroById.and.returnValue(() => existing);
    activatedRouteStub.snapshot.paramMap.get.and.returnValue('5');

    component.ngOnInit();

    expect(component.isCreationMode).toBeFalse();
    expect(component.hero.id).toBe(5);
    expect(component.heroForm.get('name')?.value).toBe('ExistingHero');
  });

  it('should not submit if invalid', () => {
    component.heroForm.get('name')?.setValue('');
    component.onSubmit();
    expect(heroStoreSpy.createHero).not.toHaveBeenCalled();
    expect(heroStoreSpy.updateHero).not.toHaveBeenCalled();
  });

  it('should open dialog and crate hero on confirm', () => {
    component.heroForm.get('name')?.setValue('New Hero');
    component.isCreationMode = true;

    component.onSubmit();
    expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      jasmine.any(Object)
    );

    dialogResult$.next(true);
    dialogResult$.complete();

    expect(heroStoreSpy.createHero).toHaveBeenCalledWith('New Hero');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
  });

  it('should open dialog and update hero on confirm', () => {
    const existing = new Hero('Original');
    existing.id = 9;
    component.hero = existing;
    component.isCreationMode = false;
    component.heroForm.get('name')?.setValue('Updated Name');

    component.onSubmit();
    dialogResult$.next(true);
    dialogResult$.complete();

    expect(heroStoreSpy.updateHero).toHaveBeenCalled();
    const passedHero = heroStoreSpy.updateHero.calls.mostRecent().args[0] as Hero;
    expect(passedHero.id).toBe(9);
    expect(passedHero.name).toBe('Updated Name');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
  });

  it('should navigate on cancel', () => {
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
  });

});
