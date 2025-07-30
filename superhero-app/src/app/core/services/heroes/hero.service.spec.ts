import { TestBed } from '@angular/core/testing';

import { HeroService } from './hero.service';
import { Hero } from '@core/models/hero.model';
import { ErrorCodes } from '@core/utils/errorcodes';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  afterEach(() => {
    service.resetToInitialState();
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
      const heroes = service.fillWithMockHeroes();
      expect(heroes.length).toBeGreaterThan(0);
      expect(heroes[0]).toBeInstanceOf(Hero);
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
      const newHero = new Hero('NewName');
      service.create(newHero).subscribe((createdHero: Hero) => {
        service.getAll().subscribe((heroes: Hero[]) => {
          expect(heroes).toContain(
            jasmine.objectContaining({
              id: newHero.id,
              name: newHero.name,
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
        const updatedHero = new Hero('Updated Hero', heroes[0].id);
        service.update(updatedHero).subscribe((hero: Hero) => {
          expect(hero).toEqual(updatedHero);
          done();
        });
      });
    });
  });

  describe('error handling', () => {
    it('Should handle duplicate ID error', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        const duplicatedIdHero = new Hero('Duplicated Hero', heroes[0].id);

        service.create(duplicatedIdHero).subscribe({
          next: () => {
            fail(ErrorCodes.DUPLICATE_ID + ' was expected');
            done();
          },
          error: (error) => {
            expect(error.code).toBe(ErrorCodes.DUPLICATE_ID);
            done();
          },
        });
      });
    });

    it('should handle duplicate name error', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        const duplicatedNameHero = new Hero(heroes[0].name);
        service.create(duplicatedNameHero).subscribe({
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
      const nonExistentHero = new Hero('non existing hero', 999);
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

    it('should return empty array for out of range page', (done) => {
      service.getAllPaginated(999, 5).subscribe((heroes: Hero[]) => {
        expect(heroes.length).toBe(0);
        done();
      });
    });
  });

  describe('pagination', () => {
    it('should return paginated heroes', (done) => {
      service.getAll().subscribe((heroes: Hero[]) => {
        service.getAllPaginated(1, 5).subscribe((paginatedHeroes: Hero[]) => {
          expect(paginatedHeroes.length).toBe(heroes.splice(0, 5).length);
          done();
        });
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

  describe('utility methods', () => {
    it('should check hero Id exists', () => {
      const hero = new Hero('New hero');
      service.create(hero).subscribe();

      const idExists = service.idAlreadyExists(hero.id);
      expect(idExists).toBeTrue();
    });

    it ('should identify non existing Id', () => {
      const result = service.idAlreadyExists(999);
      expect(result).toBe(false);
    });

    it('should check if hero name exists', () => {
      const hero = new Hero('new hero');
      service.create(hero).subscribe();

      const exists = service.nameAlreadyExists(hero.name);
      expect(exists).toBeTrue();
    });

    it('should identify non existing name', () => {
      const result = service.nameAlreadyExists('Non existing hero');
      expect(result).toBe(false);
    });
  });
});
