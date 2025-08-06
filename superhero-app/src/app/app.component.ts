import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from '@shared/components/welcome/welcome.component';
import { Subscription } from 'rxjs';
import { DialogService } from '@core/services/dialog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  dialogService = inject(DialogService);
  welcomeAlreadyShown = false;
  welcomeDialogSubscription!: Subscription;

  ngOnInit(): void {
    this.welcomeAlreadyShown = localStorage.getItem('welcomeShown') === 'true';
    if (!this.welcomeAlreadyShown) this.showWelcomeDialog();
  }

  showWelcomeDialog(): void {
    if (!this.welcomeAlreadyShown) {
      this.welcomeDialogSubscription = this.dialogService
        .openDialog(WelcomeComponent).afterClosed().subscribe(() => {
        this.setWelcomeShown();
      });
    }
  }

  setWelcomeShown(): void {
    localStorage.setItem('welcomeShown', 'true');
    this.welcomeAlreadyShown = true;
    this.welcomeDialogSubscription?.unsubscribe();
  }
}
