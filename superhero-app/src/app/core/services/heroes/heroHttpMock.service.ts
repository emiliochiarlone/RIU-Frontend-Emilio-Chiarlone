import { inject, Injectable } from '@angular/core';
import { mockedHeroNames } from '../../models/mockedHeroes';
import { Hero } from '@core/models/hero.model';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * @description HeroHttpMockService is a mock http service using httpclient to make the LoadingInterceptor manage the loading
  In a real application making actual HTTP requests, this architecture would help to divide Heroes logic in two layers:
    1 - Application State Layer (HeroStore).
    2 - Http Requests Layer(HeroHttpMockService).
*/

@Injectable({
  providedIn: 'root',
})

export class HeroHttpMockService {
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

}
