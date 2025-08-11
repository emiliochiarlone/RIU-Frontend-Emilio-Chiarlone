import { TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ConfirmationDialogComponent', () => {
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  });

  function createComponent(data: ConfirmationDialogData | null) {
    TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    return TestBed.createComponent(ConfirmationDialogComponent).componentInstance;
  }

  it('should create', () => {
    const component = createComponent({
      title: 'T', message: 'M', confirmText: 'C', cancelText: 'X'
    });
    expect(component).toBeTruthy();
  });

  it('should set default confirmText and cancelText if not provided', () => {
    const data: ConfirmationDialogData = { title: 'test ', message: 'essage test' };
    const component = createComponent(data);
    expect(data.confirmText).toBe('Confirmar');
    expect(data.cancelText).toBe('Cancelar');
  });

  it('should not set defaults if data is null', () => {
    const component = createComponent(null);
    expect(component.data).toBeNull();
  });

  it('should close dialog with true on confirm', () => {
    const component = createComponent({ title: 'test', message: 'message test' });
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    const component = createComponent({ title: 'Test title', message: 'Message test' });
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});