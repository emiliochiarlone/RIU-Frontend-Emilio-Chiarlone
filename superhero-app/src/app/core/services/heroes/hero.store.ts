import { computed, effect, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { Hero } from '@core/models/hero.model';
import { HeroHttpMockService } from './heroHttpMock.service';
import { HeroState } from './hero.state';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ErrorCodes, HeroError } from '@core/utils/errorcodes';
import { MessageService } from '../message.service';

const initialState: HeroState = {
  heroes: [],
  isLoading: false,
  errorMessage: null,
  errorCode: null,
  searchTerm: '',
};

/**
 * @Description Hero Store implementation using NgRx SignalStore.
 * This store manages the state of heroes, including loading, creating, updating, deleting, and searching heroes.
 * It provides methods to interct with the HeroHttpService (Http Mock) and handles errors appropriately (ErrorCodes, HeroError).
 * It also has computed properties for easy access (heroCount, hasHeroes, filteredHeroes, etc).
 * The store initializes by loading mock heroes using onInit Hook).
 * Store also uses MessageService to show messages errors automatically.
 * IMPORTANT: The HeroHttpMockService responses are completely unused by this store.
 *
 * @structure
 * - **withState**: Store setup and initial state validation
 * - **withComputed**: Reactive values and getters
 * - **withMethods**: CRUD and utilities.
 * - **withHooks**: Load mock on initialization and show notifications.
 *
 * @see HeroHttpMockService for the HTTP mock implementation.
 * @see HeroState for the state interface.
 * @see ErrorCodes and HeroError for error handling.
 * @see MessageService for message centralization.
 *
 * @test @link
 *
 * @author: @emiliochiarlone
 * @date: 07-08-2025
 * @version: 1.0.0
 */
export const HeroStore = signalStore(
  { providedIn: 'root' },

  withState<HeroState>(initialState),

  withComputed((store) => ({
    heroCount: computed<number>(() => store.heroes().length),
    hasHeroes: computed<boolean>(() => store.heroes().length > 0),
    hasError: computed<boolean>(
      () => store.errorMessage() !== null && store.errorCode() !== null
    ),
    getHeroById: computed<(id: number) => Hero | null>(() => (id: number) => {
      return store.heroes().find((hero) => hero.id === id) || null;
    }),
    filteredHeroes: computed<Hero[]>(() => {
      const term = store.searchTerm().trim().toLowerCase();
      if (!term) return store.heroes();
      return store
        .heroes()
        .filter((hero) =>
          hero.name.toLowerCase().includes(term)
        );
    }),
    nameAlreadyExists: computed(() => (name: string, excludeId?: number) => {
      if (!name) return false;
      const nameToCompare: string = name.trim().toLowerCase();
      return store
        .heroes()
        .some(
          (hero) =>
            hero.name.trim().toLowerCase() === nameToCompare &&
            hero.id !== excludeId
        );
    }),
    idAlreadyExists: computed(() => (id: number) => {
      return store.heroes().some((hero) => hero.id === id);
    }),
  })),

  withMethods((store, heroService = inject(HeroHttpMockService)) => {

    //Utility methods
    const startLoading = () =>
      patchState(store, {
        isLoading: true,
        errorMessage: null,
        errorCode: null,
      });

    const setIdle = () =>
      patchState(store, {
        isLoading: false,
      });

    const setError = (e: HeroError) =>
      patchState(store, {
        errorMessage: e.message,
        errorCode: e.code,
        isLoading: false,
      });

    const setDuplicate = () =>
      patchState(store, {
        isLoading: false,
        errorMessage: 'El héroe ya existe',
        errorCode: ErrorCodes.DUPLICATE_NAME,
      });

    const setNotFound = () =>
      patchState(store, {
        isLoading: false,
        errorMessage: 'Héroe no encontrado',
        errorCode: ErrorCodes.HERO_NOT_FOUND,
      });

    return {
      clearError: () =>
      patchState(store, { errorMessage: null, errorCode: null }),
      setIdle,
      startLoading,

      //Crud methods
      getHeroes: rxMethod<void>(
        pipe(
          tap(() => startLoading()),
          switchMap(() =>
            heroService.getAll().pipe(
              tapResponse({
                next: () => patchState(store, { isLoading: false }),
                error: (error: HeroError) => setError(error),
              })
            )
          )
        )
      ),

      createHero: rxMethod<string>(
        pipe(
          tap(() => {
            startLoading();
          }),
          switchMap((heroName) => {
            if (!heroName || heroName.trim() === '') {
              setError({ message: 'El nombre del héroe es inválido', code: ErrorCodes.INVALID_NAME });
              return EMPTY;
            }
            if (store.nameAlreadyExists()(heroName)) {
              setDuplicate();
              return EMPTY;
            }
            return heroService.create(heroName).pipe(
              tapResponse({
                next: (hero: Hero) => {
                  const heroes = [...store.heroes(), hero];
                  patchState(store, { heroes, isLoading: false });
                },
                error: (error: HeroError) => setError(error),
              })
            );
          })
        )
      ),

      updateHero: rxMethod<Hero>(
        pipe(
          tap(() => {
            startLoading();
          }),
          switchMap((hero) => {
            if (store.nameAlreadyExists()(hero.name, hero.id)) {
              setDuplicate();
              return EMPTY;
            }
            return heroService.update(hero).pipe(
              tapResponse({
                next: (updatedHero) => {
                  const heroes = store
                    .heroes()
                    .map((h) => (h.id === updatedHero.id ? updatedHero : h));
                  patchState(store, { heroes, isLoading: false });
                  return updatedHero;
                },
                error: (error: HeroError) => setError(error),
              })
            );
          })
        )
      ),

      deleteHero: rxMethod<number>(
        pipe(
          tap(() => startLoading()),
          switchMap((id) => {
            if (!store.idAlreadyExists()(id)) {
              setNotFound();
              return EMPTY;
            }
            return heroService.delete(id).pipe(
              tapResponse({
                next: () => {
                  const heroes = store.heroes().filter((h) => h.id !== id);
                  patchState(store, { heroes, isLoading: false });
                },
                error: (error: HeroError) => setError(error),
              })
            );
          })
        )
      ),

      findByName: rxMethod<string>(
        pipe(
          tap(() => startLoading()),
          switchMap((name) =>
            heroService.findByName((name || '').trim()).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    searchTerm: (name || '').trim(),
                    isLoading: false,
                  });
                },
                error: (error: HeroError) => setError(error),
              })
            )
          )
        )
      ),

      loadMockHeroes: rxMethod<void>(
        pipe(
          tap(() => startLoading()),
          switchMap(() => {
            return heroService.getMockHeroes().pipe(
              tapResponse({
                next: (heroes) => {
                  patchState(store, { heroes, isLoading: false });
                  return heroes;
                },
                error: (error: HeroError) => setError(error),
              })
            );
          })
        )
      ),
    };
  }),

  withHooks((store, messageService = inject(MessageService)) => ({
    onInit: () => {
      store.loadMockHeroes();
    },

    onErrorChange: effect(() => {
      const error = store.errorMessage();
      const code = store.errorCode();
      if (error && code) {
        messageService.showMessage(error);
      }
    }),
  }))
);
