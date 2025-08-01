import { Component, EventEmitter, inject, output, Output } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '@shared/material/material.module';

@Component({
  selector: 'app-welcome',
  imports: [MaterialModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  private dialog = inject(MatDialogRef<WelcomeComponent>);

  onExploreClick() {
    this.dialog.close();
  }
}
