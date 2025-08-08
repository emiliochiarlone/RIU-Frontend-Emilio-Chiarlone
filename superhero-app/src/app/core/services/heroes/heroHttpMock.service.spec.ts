import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HeroHttpMockService } from './heroHttpMock.service';
import { Hero } from '@core/models/hero.model';
import { ErrorCodes } from '@core/utils/errorcodes';
/**
 * HeroHttpService Tests were deprecated when the feature/signalStore was released.
 * In this new version, the HeroHttpService is only used internally by the HeroStore
 * to simulate http requests.
 * I decided to keep this file as an example but disabling tests.
 * the real tests were moved to hero.store.spec.ts
 */
xdescribe('HeroHttpMockService', () => {
  let service: HeroHttpMockService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeroHttpMockService],
      imports: [provideHttpClientTesting()],
    });
    service = TestBed.inject(HeroHttpMockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with mock heroes', () => {
      service.getAll().subscribe((heroes: Hero[]) => {
        expect(heroes.length).toBeGreaterThan(0);
        expect(heroes[0]).toBeInstanceOf(Hero);
      });
    });

    it('should fill with mock heroes', () => {
      service.getMockHeroes().subscribe((heroes: Hero[]) => {
           expect(heroes.length).toBeGreaterThan(0);
          expect(heroes[0]).toBeInstanceOf(Hero);
      });
    });
  });

  describe('CRUD operations', () => {
    it('should return all heroes', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        expect([...heroes]).toBeInstanceOf(Array);
        done();
      });
    });

    it('should create a hero', (done) => {
      service.create('NewName').subscribe((createdHero: Hero) => {
        service.getAll().subscribe((heroes: Hero[]) => {
          expect(heroes).toContain(
            jasmine.objectContaining({
              id: createdHero.id,
              name: createdHero.name,
            })
          );
          done();
        });
      });
    });

    it('should delete a hero', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        service.delete(heroes[0].id).subscribe((deletedId: number) => {
          expect(deletedId).toBe(heroes[0].id);
          done();
        });
      });
    });

    it('should update a hero', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        const updatedHero = heroes[0];
        updatedHero.name = 'Updated Name';
        service.update(updatedHero).subscribe((hero: Hero) => {
          expect(hero).toEqual(updatedHero);
          done();
        });
      });
    });


    //Test removed when released feature/signalStore but keeping as example

    // it('should return a hero by id', (done) => {
    //   service.getAll().subscribe((heroes: Hero[]) => {
    //     const heroId = heroes[0].id;
    //     service.get(heroId).subscribe((hero: Hero) => {
    //       expect(hero.id).toBe(heroId);
    //       done();
    //     });
    //   });
    // });
  });

  describe('error handling', () => {
    it('should handle duplicate name error', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        service.create(heroes[0].name).subscribe({
          next: () => {
            fail(ErrorCodes.DUPLICATE_NAME + ' was expected');
            done();
          },
          error: (error) => {
            expect(error.code).toBe(ErrorCodes.DUPLICATE_NAME);
            done();
          },
        });
      });
    });

    it('should handle hero not found error on delete', (done) => {
      service.delete(999).subscribe({
        next: () => {
          fail(ErrorCodes.HERO_NOT_FOUND + ' was expected');
          done();
        },
        error: (error) => {
          expect(error.code).toBe(ErrorCodes.HERO_NOT_FOUND);
          done();
        },
      });
    });

    it('should handle hero not found error on update', (done) => {
      const nonExistentHero = new Hero('non existing hero');
      service.update(nonExistentHero).subscribe({
        next: () => {
          fail(ErrorCodes.HERO_NOT_FOUND + ' was expected');
          done();
        },
        error: (error) => {
          expect(error.code).toBe(ErrorCodes.HERO_NOT_FOUND);
          done();
        },
      });
    });

    it('should handle hero not fund error on find by name', (done) => {
      service.findByName('No existing hero').subscribe((heroes: Hero[]) => {
        expect(heroes.length).toBe(0);
        done();
      });
    });
  });

  describe('find by name', () => {
    it('should find heros by name', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        const heroName = heroes[0].name;
        service.findByName(heroName).subscribe((foundHeroes: Hero[]) => {
          expect(foundHeroes[0].name).toBe(heroName);
          done();
        });
      });
    });

    it('should return all heroes if name is empty', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        service.findByName('').subscribe((heroes: Hero[]) => {
          expect(heroes.length).toBeGreaterThan(0);
          done();
        });
      });
    });
  });
});
