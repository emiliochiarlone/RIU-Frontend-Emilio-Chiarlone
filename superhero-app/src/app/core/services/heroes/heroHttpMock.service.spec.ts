import { TestBed } from '@angular/core/testing';
import { HeroHttpMockService } from './heroHttpMock.service';
import { provideHttpClient } from '@angular/common/http';

/**
 * @describe 
 */
describe('HeroHttpMockService', () => {
  let service: HeroHttpMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HeroHttpMockService,
        provideHttpClient(),
      ],
    });
    service = TestBed.inject(HeroHttpMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should return an array', (done) => {
    service.getAll().subscribe(result => {
      expect(Array.isArray(result)).toBeTrue();
      done();
    });
  });

  it('create should return a hero with the given name', (done) => {
    service.create('TestHero').subscribe(hero => {
      expect(hero).toBeTruthy();
      expect(hero.name).toBe('TestHero');
      done();
    });
  });

  it('update should return the hero passed as param', (done) => {
    const hero = { id: 1, name: 'UpdatedHero' };
    service.update(hero as any).subscribe(result => {
      expect(result.id).toEqual(hero.id);
      expect(result.name).toEqual(hero.name);
      done();
    });
  });

  it('delete should return the id passed as param', (done) => {
    service.delete(123).subscribe(result => {
      expect(result).toBe(123);
      done();
    });
  });

  it('findByName should return an array (mock)', (done) => {
    service.findByName('batman').subscribe(result => {
      expect(Array.isArray(result)).toBeTrue();
      done();
    });
  });
});