import { TestBed } from '@angular/core/testing';
import { HeroStore } from './hero.store';
import { HeroHttpMockService } from './heroHttpMock.service';
import { Hero } from '@core/models/hero.model';
import { ErrorCodes } from '@core/utils/errorcodes';
import { of, throwError } from 'rxjs';
import { mockedHeroNames } from '@core/models/mockedHeroes';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from '../message.service';

/**
 * @description HeroStore Test Suite
 * Tests the NgRx SignalStore implementation for hero management
 * covering CRUD operations, error handling, and computed properties
 * using Jasmine and Angular TestBed.
 * 
 * @structure
 * - **Initialization Tests**: Store setup and initial state validation
 * - **Computed Properties**: Reactive computations and getters
 * - **CRUD Operations**: Create, read, update, Delete hero operations
 * - **Utility Methods**: Helper functions and state management
 * - **Error Handling**: Error states and recovery mechanisms
 * 
 * @author Emilio Chiarlone
 * @date 07-08-2025
 */
describe('HeroStore', () => {
  let store: InstanceType<typeof HeroStore>;
  let heroHttpService: jasmine.SpyObj<HeroHttpMockService>;

  const mockHeroes = mockedHeroNames.map((name, index) => {
    const hero = new Hero(name);
    hero.id = index + 1;
    return hero;
  });

  beforeEach(() => {
    const heroServiceSpy = jasmine.createSpyObj('HeroHttpService', [
      'getAll',
      'create',
      'update',
      'delete',
      'findByName',
      'getMockHeroes',
    ]);

    const messageServiceSpy = jasmine.createSpyObj('MessageService', [
      'showMessage',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: HeroHttpMockService, useValue: heroServiceSpy },
        provideHttpClientTesting(),
      ],
    });

    heroHttpService = TestBed.inject(
      HeroHttpMockService
    ) as jasmine.SpyObj<HeroHttpMockService>;

    heroHttpService.getMockHeroes.and.returnValue(
      of(mockedHeroNames.map((name) => new Hero(name)))
    );

    heroHttpService.getAll.and.returnValue(of([]));
    heroHttpService.delete.and.returnValue(of(1));
    heroHttpService.findByName.and.returnValue(of([]));
    heroHttpService.create.and.callFake((name: string) => of(new Hero(name)));
    heroHttpService.update.and.callFake((hero: Hero) => of(hero));

    store = TestBed.inject(HeroStore);
  });

  describe('initial State', () => {
    it('should have initial State post onInit hook: LoadMockHeroes', () => {
      spyOn(store, 'loadMockHeroes').and.callThrough();
      expect(store.heroes().length).toEqual(mockHeroes.length);
      expect(store.isLoading()).toBe(false);
      expect(store.errorMessage()).toBeNull();
      expect(store.errorCode()).toBeNull();
      expect(store.searchTerm()).toBe('');
    });
  });

  describe('computed Propeties', () => {
    it('should calculate hero count', () => {
      expect(store.heroCount()).toEqual(store.heroes().length);
    });

    it('should determine if has heroes', () => {
      expect(store.hasHeroes()).toBe(store.heroes().length > 0);
    });

    it('should determine if has errors', () => {
      expect(!!store.hasError()).toBe(
        !!store.errorCode() && !!store.errorMessage()
      );
    });

    it('should get hero by id', () => {
      const currentHeroes = store.heroes();
      const hero = store.getHeroById()(currentHeroes[0].id);

      expect(hero?.name).toBe(currentHeroes[0].name);

      const nonExistentHero = store.getHeroById()(0);
      expect(nonExistentHero).toBeNull();
    });

    it('should filter heroes by name using search term internally', () => {
      store.findByName('man');
      expect(store.filteredHeroes().length).toBe(
        store.heroes().filter((hero) => hero.name.toLowerCase().includes('man'))
          .length
      );
    });

    it('should check if name already exists', () => {
      const existingName = store.heroes()[0];
      expect(store.nameAlreadyExists()(existingName.name)).toBe(true);
      expect(store.nameAlreadyExists()('NonExistingName')).toBe(false);
    });

    it('should check if ID exists', () => {
      const existingId = store.heroes()[0].id;
      expect(store.idAlreadyExists()(existingId)).toBe(true);
      expect(store.idAlreadyExists()(0)).toBe(false);
    });
  });
  describe('Hero CRUD methods', () => {
    describe('createHero method', () => {
      it('should create a new hero successfully', () => {
        const newHeroName = 'newHeroName';
        store.createHero(newHeroName);
        expect(
          store.heroes().find((hero) => hero.name === newHeroName)
        ).toBeDefined();
        expect(store.isLoading()).toBe(false);
        expect(store.hasError()).toBe(false);
      });

      it('should handle duplicate name error at Creation', () => {
        store.createHero(store.heroes()[0].name);

        expect(store.isLoading()).toBe(false);
        expect(store.errorCode()).toBe(ErrorCodes.DUPLICATE_NAME);
      });
    });

    describe('updateHero method', () => {
      it('should update Hero Name', () => {
        const heroToUpdate: Hero = store.heroes()[0];

        const updatedHero: Hero = new Hero('Updated Name');

        updatedHero.id = heroToUpdate.id;

        store.updateHero(updatedHero);

        expect(
          store.heroes().find((hero) => hero.id === heroToUpdate.id)?.name
        ).toBe('Updated Name');
        expect(store.isLoading()).toBe(false);
        expect(store.hasError()).toBe(false);
      });

      it('should handle duplicate name on updat', () => {
        const heroToUpdate = new Hero(store.heroes()[0].name);
        heroToUpdate.id = store.heroes()[0].id;

        store.updateHero(heroToUpdate);

        expect(store.errorCode()).toBe(ErrorCodes.DUPLICATE_NAME);
      });
    });

    describe('deleteHero method', () => {
      it('should delete a hero', () => {
        const heroToDelete = store.heroes()[0];
        store.deleteHero(heroToDelete.id);

        expect(store.heroes()).not.toContain(heroToDelete);
        expect(store.hasError()).toBe(false);
      });

      it('should handle hero not found on delete', () => {
        store.deleteHero(0);

        expect(store.errorCode()).toBe(ErrorCodes.HERO_NOT_FOUND);
      });
    });

    describe('findByName method', () => {
      it('should set search term', () => {
        store.findByName('man');

        expect(store.searchTerm()).toBe('man');
        expect(store.isLoading()).toBe(false);
      });

      it('should clear search term when empty string provided', () => {
        store.findByName('');

        expect(store.searchTerm()).toBe('');
      });
    });
  });

  describe('Utility methods', () => {
    it('should clear error', () => {
      const error = { message: 'Test error', code: ErrorCodes.HERO_NOT_FOUND };
      heroHttpService.getAll.and.returnValue(throwError(() => error));
      store.getHeroes();

      expect(store.errorMessage()).toBeTruthy();
      expect(store.errorCode()).toBeTruthy();

      store.clearError();

      expect(store.errorMessage()).toBeNull();
      expect(store.errorCode()).toBeNull();
    });

    it('should set idle state', () => {
      store.setIdle();

      expect(store.isLoading()).toBe(false);
      expect(store.errorMessage()).toBeNull();
      expect(store.errorCode()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle error', () => {
      const networkError = {
        message: 'Error message',
        code: ErrorCodes.HERO_NOT_FOUND,
      };
      heroHttpService.getAll.and.returnValue(throwError(() => networkError));

      store.getHeroes();

      expect(store.errorMessage()).toBe('Error message');
      expect(store.isLoading()).toBe(false);
    });

    it('should reset error state on new operations', () => {
      const error = {
        message: 'previous error',
        code: ErrorCodes.HERO_NOT_FOUND,
      };
      heroHttpService.getAll.and.returnValue(throwError(() => error));
      store.getHeroes();

      expect(store.hasError()).toBe(true);

      store.createHero('New Hero');

      expect(store.errorMessage()).toBeNull();
      expect(store.errorCode()).toBeNull();
    });

  });
});
