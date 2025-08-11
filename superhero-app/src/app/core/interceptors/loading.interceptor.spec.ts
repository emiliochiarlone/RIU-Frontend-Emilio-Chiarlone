import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { HttpClient } from '@angular/common/http';

describe('LoadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    loadingSpy = jasmine.createSpyObj('LoadingService', ['startLoading', 'stopLoading']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
        { provide: LoadingService, useValue: loadingSpy },
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

 it('call start/stop at request', fakeAsync(() => {
  http.get('/api/test').subscribe();
  const req = httpMock.expectOne('/api/test');
  expect(loadingSpy.startLoading).toHaveBeenCalled();

  req.flush({ ok: true });

  tick(600); // interceptor delay: 500ms
  expect(loadingSpy.stopLoading).toHaveBeenCalled();

  httpMock.verify();
}));
});
