import { inject, Injectable } from '@angular/core';
import { mockedHeroNames } from '../../models/mockedHeroes';
import { Hero } from '@core/models/hero.model';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private http = inject(HttpClient);
  apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor() {
  }


  create(heroName: string): Observable<Hero> {
    return this.http.post<Hero>(this.apiUrl, { name: heroName }).pipe(
      map(() => {
        return new Hero(heroName);
      })
    );
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        return id;
      })
    );
  }

  getAll(): Observable<Hero[]> {
    return this.http
      .get<Hero[]>(this.apiUrl)
      .pipe(map(() => []));
  }

  findByName(name: string): Observable<Hero[]> {

    return this.http
      .get<Hero[]>(this.apiUrl + '?name=' + name)
      .pipe(
        map(() => [])
      );
  }

  update(hero: Hero): Observable<Hero> {

    const heroCopy = new Hero(hero.name);
    heroCopy.id = hero.id;

    return this.http.put<Hero>(`${this.apiUrl}/${hero.id}`, heroCopy)
      .pipe(map(() => heroCopy));
  }

  getMockHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(`${this.apiUrl}`).pipe(
      map(() => mockedHeroNames.map((name: string) => new Hero(name)))
    );
  }


  idAlreadyExists(id: number, currentHeroes: Hero[]): boolean {
    return currentHeroes.some((hero: Hero) => hero.id === id);
  }

  nameAlreadyExists(heroName: string, currentHeroes: Hero[] ): boolean {
    return currentHeroes.some(
      (hero: Hero) => hero.name.toLowerCase() === heroName.toLowerCase()
    );
  }

}
