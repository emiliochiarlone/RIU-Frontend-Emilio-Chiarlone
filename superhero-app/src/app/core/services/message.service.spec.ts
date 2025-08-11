import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call MatSnackBar.open with expected params', () => {
    const ref = {} as MatSnackBarRef<TextOnlySnackBar>;
    snackBarSpy.open.and.returnValue(ref);

    const msg = 'Mensaje de prueba';
    service.showMessage(msg);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      msg,
      'cerrar',
      jasmine.objectContaining({
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
    );
  });

  it('should return the MatSnackBarRef returned by open', () => {
    const expectedRef = {} as MatSnackBarRef<TextOnlySnackBar>;
    snackBarSpy.open.and.returnValue(expectedRef);

    const result = service.showMessage('Hola');

    expect(result).toBe(expectedRef);
  });
});
