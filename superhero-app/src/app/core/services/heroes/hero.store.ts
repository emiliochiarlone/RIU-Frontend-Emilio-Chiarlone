import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { Hero } from '@core/models/hero.model';
import { HeroService } from './hero.service';
import { HeroState } from './hero.state';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, tap, of } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ErrorCodes } from '@core/utils/errorcodes';

const initialState: HeroState = {
  heroes: [],
  isLoading: false,
  errorMessage: null,
  errorCode: null,
  searchTerm: '',
};

export const HeroStore = signalStore(
  { providedIn: 'root', protectedState: true },
  withState<HeroState>(initialState),

  withComputed((store,) => ({
    heroCount: computed(() => store.heroes().length),
    hasHeroes: computed(() => store.heroes().length > 0),
    hasError: computed(() => store.errorMessage() && store.errorCode()),
    getHeroById: computed(() => (id: number) => {
      return store.heroes().find((h) => h.id === id) || null;
    }),
    filteredHeroes: computed(() => {
      return store
        .heroes()
        .filter((hero) =>
          hero.name.toLowerCase().includes(store.searchTerm().toLowerCase())
        );
    }),
  })),

  withMethods((store, heroService = inject(HeroService)) => ({
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
              error: (error: any) =>
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
          if (heroService.nameAlreadyExists(heroName, store.heroes())) {
            patchState(store, {
              isLoading: false,
              errorMessage: 'El héroe ya existe',
              errorCode: ErrorCodes.DUPLICATE_NAME,
            });
            return EMPTY;
          }
          return heroService.create(heroName).pipe(
            tapResponse({
              next: (hero) => {
                const heroes = [...store.heroes(), hero];
                patchState(store, { heroes, isLoading: false });
                return hero;
              },
              error: (error: any) =>
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
          if (heroService.nameAlreadyExists(hero.name, store.heroes())) {
            patchState(store, {
              isLoading: false,
              errorMessage: 'El herroe ya existe',
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
              error: (error: any) =>
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
          if (!heroService.idAlreadyExists(id, store.heroes())) {
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
              error: (error: any) =>
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
              error: (error: any) =>
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

  withHooks((store) => ({
    onInit: () => {
      store.loadMockHeroes();
    },
  }))
);
