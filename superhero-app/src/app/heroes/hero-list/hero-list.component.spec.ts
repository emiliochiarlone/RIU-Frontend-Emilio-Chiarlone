import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroListComponent } from './hero-list.component';
import { HeroHttpMockService } from '@core/services/heroes/heroHttpMock.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;

  beforeEach(async () => {
    const mockHeroService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of([])),
      delete: jasmine.createSpy('delete').and.returnValue(of(true))
    };

    const mockLoadingService = {
      setLoading: jasmine.createSpy('setLoading')
    };

    const mockPaginatorFormatterService = {
      format: jasmine.createSpy('format')
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [HeroListComponent, NoopAnimationsModule],
      providers: [
        { provide: HeroHttpMockService, useValue: mockHeroService },
        { provide: 'LoadingService', useValue: mockLoadingService },
        { provide: 'PaginatorFormatterService', useValue: mockPaginatorFormatterService },
        { provide: 'Router', useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
