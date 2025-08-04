import { inject, Injectable } from '@angular/core';
import { mockedHeroNames } from '../../models/mockedHeroes';
import { Hero } from '@core/models/hero.model';
import { delay, Observable, of, throwError, map } from 'rxjs';
import { ErrorCodes } from '@core/utils/errorcodes';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private _heroes: Hero[] = [];
  private http = inject(HttpClient);
  apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor() {
    this.fillWithMockHeroes();
  }

  fillWithMockHeroes(): Hero[] {
    this._heroes = mockedHeroNames.map((name: string) => new Hero(name));
    return [...this._heroes];
  }

  create(heroName: string): Observable<Hero> {
    if (this.nameAlreadyExists(heroName)) {
      return throwError(() => ({
        code: ErrorCodes.DUPLICATE_NAME,
        message: 'Ya existe un héro con este nombre',
      }));
    }

    this._heroes.push(new Hero(heroName));
    const heroCopy = new Hero(heroName);
    heroCopy.id = this._heroes[this._heroes.length - 1].id;
    return this.http.post<Hero>(this.apiUrl, heroCopy).pipe(
      map(() => {
        return heroCopy;
      })
    );
  }

  delete(id: number): Observable<number> {
    const index = this._heroes.findIndex((h) => h.id === id);
    if (index === -1) {
      return throwError(() => ({
        code: ErrorCodes.HERO_NOT_FOUND,
        message: 'No se encontro el héroe con el Id proporcionado.',
      }));
    }
    this._heroes.splice(index, 1);
    return this.http.delete<number>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        return id;
      })
    );
  }

  getById(id: number): Observable<Hero> {
    const hero = this._heroes.find((h) => h.id === id);
    if (!hero) {
      return throwError(() => ({
        code: ErrorCodes.HERO_NOT_FOUND,
        message: 'No se encontro el héroe con el Id proporcionado.',
      }));
    }
    const heroCopy = new Hero(hero.name);
    heroCopy.id = hero.id;

    return this.http.get<Hero>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        return heroCopy;
      })
    );
  }

  getAll(): Observable<Hero[]> {
    return this.http
      .get<Hero[]>(this.apiUrl)
      .pipe(map(() => [...this._heroes]));
  }

  findByName(name: string): Observable<Hero[]> {
    if (!name) {
      return of([...this._heroes].sort((a, b) => a.name.localeCompare(b.name)));
    }

    let foundHeroes = this._heroes.filter((hero: Hero) =>
      hero.name.toLowerCase().includes(name.toLowerCase())
    );

    return this.http
      .get<Hero[]>(this.apiUrl)
      .pipe(
        map(() => [...foundHeroes].sort((a, b) => a.name.localeCompare(b.name)))
      );
  }

  update(hero: Hero): Observable<Hero> {
    const index = this._heroes.findIndex((h) => h.id === hero.id);
    if (index === -1) {
      return throwError(() => ({
        code: ErrorCodes.HERO_NOT_FOUND,
        message: 'No se encontro el héroe con el Id proorcionado.',
      }));
    }

    const existingHeroName = this._heroes.find(
      (h) =>
        h.name.toLowerCase() === hero.name.toLowerCase() &&
        h.id !== hero.id
    );

    if (existingHeroName) {
      return throwError(() => ({
        code: ErrorCodes.DUPLICATE_NAME,
        message: 'Ya existe un héroe con este nombre',
      }));
    }

    this._heroes[index] = hero;
    const heroCopy = new Hero(hero.name);
    heroCopy.id = hero.id;

    return this.http.put<Hero>(`${this.apiUrl}/${hero.id}`, heroCopy)
      .pipe(map(() => heroCopy));
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
