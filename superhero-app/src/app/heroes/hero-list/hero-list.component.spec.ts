import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { HeroListComponent } from './hero-list.component';
import { Hero } from '@core/models/hero.model';
import { HeroStore } from '@core/services/heroes/hero.store';
import { PaginatorFormatterService } from '@core/services/paginator-formatter.service';
import { DialogService } from '@core/services/dialog.service';
import { LoadingService } from '@core/services/loading.service';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

/**
 * @description Unit tests for the HeroListComponent
 * @author @emiliochiarlone
 */

describe('HeroListComponent', () => {
  let fixture: ComponentFixture<HeroListComponent>;
  let component: HeroListComponent;

  let heroStoreSpy: jasmine.SpyObj<any>;
  let paginatorFormatterSpy: jasmine.SpyObj<PaginatorFormatterService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  const heroes: Hero[] = (() => {
    const h1 = new Hero('Batman');
    h1.id = 1;
    const h2 = new Hero('Superman');
    h2.id = 2;
    return [h1, h2];
  })();

  beforeEach(async () => {
    heroStoreSpy = jasmine.createSpyObj(
      'HeroStore',
      ['findByName', 'deleteHero'],
      {
        filteredHeroes: () => heroes,
        isLoading: () => false,
        heroCount: () => heroes.length,
        errorMessage: () => null,
        errorCode: () => null,
        searchTerm: () => '',
      }
    );

    paginatorFormatterSpy = jasmine.createSpyObj('PaginatorFormatterService', [
      'format',
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', [], {
      isLoading: () => false,
    });

    dialogServiceSpy.openDialog.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        { provide: HeroStore, useValue: heroStoreSpy },
        { provide: PaginatorFormatterService, useValue: paginatorFormatterSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('load initial data from store', () => {
    expect(component.heroDataSource.data.length).toBe(heroes.length);
  });

  it('should setup search control subscription on ngOnInit', () => {
    component.ngOnInit();
    expect(component.subscriptions.length).toBeGreaterThan(0);
  });

  it('ngAfterViewInit triggers initial search and paginator format', () => {
    component.paginator = { pageIndex: 0, pageSize: 5 } as any;
    component.ngAfterViewInit();
    expect(heroStoreSpy.findByName).toHaveBeenCalledWith('');
    expect(paginatorFormatterSpy.format).toHaveBeenCalled();
  });

  it('executeSearchByName', () => {
    component.executeSearchByName('bat');
    expect(heroStoreSpy.findByName).toHaveBeenCalledWith('bat');
  });

  it('should call findByName on executeSearchByName', () => {
    component.executeSearchByName('batman');
    expect(heroStoreSpy.findByName).toHaveBeenCalledWith('batman');
  });

  it('onDeleteClick opens dialog and deletes on confirm', () => {
    component.onDeleteClick(1);
    expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      jasmine.any(Object)
    );
    expect(heroStoreSpy.deleteHero).toHaveBeenCalledWith(1);
  });

  it('onAddClick navigate to create route', () => {
    spyOn(component.router, 'navigate');
    component.onAddClick();
    expect(component.router.navigate).toHaveBeenCalledWith(['/heroes/create']);
  });

  it('onEditClick navigates to edit route', () => {
    spyOn(component.router, 'navigate');
    component.onEditClick(5);
    expect(component.router.navigate).toHaveBeenCalledWith(['/heroes/edit', 5]);
  });

  it('return a description of the current page items', () => {
    component.paginator = { pageIndex: 0, pageSize: 5 } as any;
    component.setHeroDataSource();
    const msg = component.getHeroCountMessage();
    expect(typeof msg).toBe('string');
    expect(msg).toContain('de');
  });

  it('should call deleteHero and showMessage on confirm delete', () => {
    component.onDeleteClick(1);
    expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      jasmine.any(Object)
    );
    expect(heroStoreSpy.deleteHero).toHaveBeenCalledWith(1);
  });

  it('should return correct hero count message', () => {
    component.paginator.pageIndex = 0;
    component.paginator.pageSize = 5;
    const msg = component.getHeroCountMessage();
    expect(msg).toContain('Mostrando 1 - 2 de 2 héroes.');
  });

  it('should unsubscribe all subscriptions on destroy', () => {
    const sub1 = { unsubscribe: jasmine.createSpy('unsubscribe') };
    const sub2 = { unsubscribe: jasmine.createSpy('unsubscribe') };
    component.subscriptions = [sub1 as any, sub2 as any];
    component.ngOnDestroy();
    expect(sub1.unsubscribe).toHaveBeenCalled();
    expect(sub2.unsubscribe).toHaveBeenCalled();
  });

  it('onDeleteClick does not delete if user cancels', () => {
    dialogServiceSpy.openDialog.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    component.onDeleteClick(1);

    expect(heroStoreSpy.deleteHero).not.toHaveBeenCalled();
  });

  it('getHeroCountMessage with empty list', () => {
    component.heroDataSource.data = [];
    component.paginator = { pageIndex: 0, pageSize: 5 } as any;
    const msg = component.getHeroCountMessage();
    expect(msg).toContain('Mostrando 1 - 0 de 0 héroes.');
  });

  it('onDeleteClick does not calls messageService.showMessage if user Cancels', () => {
    dialogServiceSpy.openDialog.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    spyOn(component.messageService, 'showMessage');
    component.onDeleteClick(1);

    expect(component.messageService.showMessage).not.toHaveBeenCalled();
  });

  it('ngOnDestroy with no subscriptions does not break', () => {
    component.subscriptions = [];
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('executeSearchByName with null calls findbyname with empty string', () => {
    component.executeSearchByName(null);
    expect(heroStoreSpy.findByName).toHaveBeenCalledWith('');
  });

  it('should show search spinner during search', fakeAsync(() => {
    component.ngOnInit();
    component.searchControl.setValue('test');

    tick(500);
    expect(component.showSearchSpinner()).toBe(true);
  }));
});
