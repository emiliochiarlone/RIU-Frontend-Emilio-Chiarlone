import { ComponentType } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog:MatDialog
  ) {
  }

  public openDialog<T>(component:ComponentType<T>): MatDialogRef<T> {
    return this.dialog.open(component);
  }

  public closeDialog(): void {
    this.dialog.closeAll();
  }

}
