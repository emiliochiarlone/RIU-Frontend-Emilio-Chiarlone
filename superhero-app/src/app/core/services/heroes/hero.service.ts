import { Injectable } from '@angular/core';
import { mockedHeroNames } from '../../models/mockedHeroes';
import { Hero } from '@core/models/hero.model';
import { Observable, of, throwError } from 'rxjs';
import { ErrorCodes } from '@core/utils/errorcodes';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private _heroes: Hero[] = [];

  constructor() {
    this.fillWithMockHeroes();
  }

  fillWithMockHeroes(): Hero[] {
    this._heroes = mockedHeroNames.map((name: string) => new Hero(name));
    return [...this._heroes];
  }

  create(hero: Hero): Observable<Hero> {
    if (this.idAlreadyExists(hero.id)) {
      return throwError(() => ({
        code: ErrorCodes.DUPLICATE_ID,
        message: 'Ya existe un héroe con este ID',
      }));
    } else if (this.nameAlreadyExists(hero.name)) {
      return throwError(() => ({
        code: ErrorCodes.DUPLICATE_NAME,
        message: 'Ya existe un héro con este nombre',
      }));
    }
    this._heroes.push(hero);
    return of(hero);
  }

  delete(id: number): Observable<number> {
    const index = this._heroes.findIndex((h) => h.id === id);
    if (index === -1) {
      return throwError(
        () => ({
          code: ErrorCodes.HERO_NOT_FOUND,
          message: 'No se encontro el héroe con el Id proporcionado.',
        })
      );
    }
    this._heroes.splice(index, 1);
    return of(id);
  }

  getAll(): Observable<Hero[]> {
    return of([...this._heroes]);
  }

  getAllPaginated(page: number, pageSize: number): Observable<Hero[]> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedHeroes = this._heroes.slice(start, end);
    return of(paginatedHeroes);
  }

  findByName(name: string): Observable<Hero[]> {
    if (!name) {
      return of([...this._heroes]);
    }
    let foundHeroes = this._heroes.filter((hero: Hero) =>
      hero.name.toLowerCase().includes(name.toLowerCase())
    );
    return of(foundHeroes);
  }

  update(hero: Hero): Observable<Hero> {
    const index = this._heroes.findIndex((h) => h.id === hero.id);
    if (index === -1) {
      return throwError(
        () => ({
          code: ErrorCodes.HERO_NOT_FOUND,
          message: 'No se encontro el héroe con el Id proporcionado.'
        })
      );
    } else {
      if (this.nameAlreadyExists(hero.name)) {
        return throwError(() => ({
          code: ErrorCodes.DUPLICATE_NAME,
          message: 'Ya existe un héroe con este nombre',
        }));
      }
    }
    this._heroes[index] = hero;
    return of(hero);
  }

  resetToInitialState(): void {
    this.fillWithMockHeroes();
  }

  idAlreadyExists(id: number): boolean {
    return this._heroes.some((hero: Hero) => hero.id === id);
  }

  nameAlreadyExists(name: string): boolean {
    return this._heroes.some(
      (hero: Hero) => hero.name.toLowerCase() === name.toLowerCase()
    );
  }

  get heroes(): Hero[] {
    return this._heroes;
  }

}
