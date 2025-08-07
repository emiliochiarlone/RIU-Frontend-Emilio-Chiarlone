import { inject, Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

    snackBar = inject(MatSnackBar);

    constructor(){}

    showMessage(messageKey: string): MatSnackBarRef<TextOnlySnackBar> {
        let snackBarConfig = new MatSnackBarConfig()
        snackBarConfig.horizontalPosition = 'center';
        snackBarConfig.verticalPosition = 'bottom';
        snackBarConfig.duration = 4000
        return this.snackBar.open(messageKey, 'cerrar', snackBarConfig);
    }
}
