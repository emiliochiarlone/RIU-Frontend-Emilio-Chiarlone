import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

describe('DialogService', () => {
  let service: DialogService;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: MatDialog, useValue: matDialogSpy },
      ],
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open dialog with component and data', () => {
    const fakeRef = {} as MatDialogRef<any>;
    matDialogSpy.open.and.returnValue(fakeRef);

    const comp = class {};
    const data = { test: 123 };
    const result = service.openDialog(comp, data);

    expect(matDialogSpy.open).toHaveBeenCalledWith(comp, jasmine.any(Object));
    expect(result).toBe(fakeRef);
  });

  it('should close all dialogs', () => {
    service.closeDialog();
    expect(matDialogSpy.closeAll).toHaveBeenCalled();
  });
});
