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
import { EMPTY, pipe, switchMap, tap, of } from 'rxjs';
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
 *
 * @see HeroHttpMockService for the HTTP mock implementation.
 * @see HeroState for the state interface.
 * @see ErrorCodes and HeroError for error handling.
 * @see MessageService for message centralization.
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
    hasError: computed<boolean>(() => store.errorMessage() !== null && store.errorCode() !== null),
    getHeroById: computed<(id: number) => Hero | null>(() => (id: number) => {
      return store.heroes().find((hero) => hero.id === id) || null;
    }),
    filteredHeroes: computed<Hero[]>(() => {
      return store
        .heroes()
        .filter((hero) =>
          hero.name.toLowerCase().includes(store.searchTerm().toLowerCase())
        );
    }),
    nameAlreadyExists: computed(() => (name: string) => {
      return store.heroes().some((hero) => hero.name.trim().toLowerCase() === name.trim().toLowerCase());
    }),
    idAlreadyExists: computed(() => (id: number) => {
      return store.heroes().some((hero) => hero.id === id);
    })
  })),

  withMethods((store, heroService = inject(HeroHttpMockService)) => ({
    getHeroes: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          })
        ),
        switchMap(() =>
          heroService.getAll().pipe(
            tapResponse({
              next: () => patchState(store, { isLoading: false }),
              error: (error: HeroError) =>
                patchState(store, {
                  errorMessage: error.message,
                  errorCode: error.code,
                  isLoading: false,
                }),
            })
          )
        )
      )
    ),

    createHero: rxMethod<string>(
      pipe(
        tap(() => {
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          });
        }),
        switchMap((heroName) => {
          if (store.nameAlreadyExists()(heroName)) {
            patchState(store, {
              isLoading: false,
              errorMessage: 'El héroe ya existe',
              errorCode: ErrorCodes.DUPLICATE_NAME,
            });
            return EMPTY;
          }
          return heroService.create(heroName).pipe(
            tapResponse({
              next: (hero: Hero) => {
                const heroes = [...store.heroes(), hero];
                patchState(store, { heroes, isLoading: false });
                return hero;
              },
              error: (error: HeroError) =>
                patchState(store, {
                  errorMessage: error.message,
                  errorCode: error.code,
                  isLoading: false,
                }),
            })
          );
        })
      )
    ),

    updateHero: rxMethod<Hero>(
      pipe(
        tap(() => {
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          });
        }),
        switchMap((hero) => {
          if (store.nameAlreadyExists()(hero.name)) {
            patchState(store, {
              isLoading: false,
              errorMessage: 'El héroe ya existe',
              errorCode: ErrorCodes.DUPLICATE_NAME,
            });
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
              error: (error: HeroError) =>
                patchState(store, {
                  errorMessage: error.message,
                  errorCode: error.code,
                  isLoading: false,
                }),
            })
          );
        })
      )
    ),

    deleteHero: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          })
        ),
        switchMap((id) => {
          if (!store.idAlreadyExists()(id)) {
            patchState(store, {
              isLoading: false,
              errorMessage: 'Héroe no encontrado',
              errorCode: ErrorCodes.HERO_NOT_FOUND,
            });
            return EMPTY;
          }
          return heroService.delete(id).pipe(
            tapResponse({
              next: () => {
                const heroes = store.heroes().filter((h) => h.id !== id);
                patchState(store, { heroes, isLoading: false });
              },
              error: (error: HeroError) =>
                patchState(store, {
                  errorMessage: error.message,
                  errorCode: error.code,
                  isLoading: false,
                }),
            })
          );
        })
      )
    ),

    findByName: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          })
        ),
        switchMap((name) => {
          patchState(store, {
            searchTerm: name || '',
            isLoading: false,
          });
          return of(store.filteredHeroes());
        })
      )
    ),

    loadMockHeroes: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            errorMessage: null,
            errorCode: null,
          })
        ),
        switchMap(() => {
          return heroService.getMockHeroes().pipe(
            tapResponse({
              next: (heroes) => {
                patchState(store, { heroes, isLoading: false });
                return heroes;
              },
              error: (error: HeroError) =>
                patchState(store, {
                  errorMessage: error.message,
                  errorCode: error.code,
                  isLoading: false,
                }),
            })
          );
        })
      )
    ),

    clearError: () => {
      patchState(store, { errorMessage: null, errorCode: null });
    },

    setIdle: () => {
      patchState(store, {
        isLoading: false,
        errorMessage: null,
        errorCode: null,
      });
    },
  })),

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

