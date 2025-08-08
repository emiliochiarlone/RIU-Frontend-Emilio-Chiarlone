import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Hero } from '@core/models/hero.model';
import { MaterialModule } from '@shared/material/material.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UppercaseDirective } from '@shared/directives/uppercase.directive';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { HeroStore } from '@core/services/heroes/hero.store';
import { DialogService } from '@core/services/dialog.service';
import { MessageService } from '@core/services/message.service';

/**
 * @description HeroFormComponent
 * Component for creating and editing heroes
 *
 * @author Emilio Chiarlone
 * @date 07-08-2025
 */
@Component({
  selector: 'app-hero-form',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    UppercaseDirective,
    LoadingSpinnerComponent,
  ],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeroFormComponent {
  heroStore = inject(HeroStore);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(DialogService);
  messageService = inject(MessageService);

  isLoading = this.heroStore.isLoading;
  errorMessage = this.heroStore.errorMessage;
  errorCode = this.heroStore.errorCode;

  heroForm!: FormGroup;
  isCreationMode: boolean = true;
  hero: Hero = new Hero('');

  constructor() {}

  ngOnInit(): void {
    this.setUpForm();
    this.determineMode();
  }

  setUpForm(): void {
    this.heroForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-ZÀ-ÿ0-9 ]+$'),
        ],
      ],
    });
  }

  determineMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isCreationMode = !id;
    if (!this.isCreationMode && id) this.loadHero(+id);
  }

  loadHero(id: number): void {
    this.hero = this.heroStore.getHeroById()(id) || new Hero('');
    if (this.hero && this.hero.id) {
      this.heroForm.patchValue({
        name: this.hero.name,
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }

  onSubmit(): void {
    if (this.heroForm.valid) {
      // decided to create two methods to follow the single responsability principle
      this.isCreationMode ? this.onCreationSubmit() : this.onEditSubmit();
    }
  }

  onCreationSubmit(): void {
    if (this.heroForm.valid) {
      this.dialogService
        .openDialog(ConfirmationDialogComponent, {
          data: {
            title: 'Crear héroe',
            message: '¿Estas seguro de que quieres crear este héroe?',
            confirmText: 'Crear',
            cancelText: 'Cancelar',
          },
        })
        .afterClosed()
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            const heroName = this.capitalizeWords(
              this.heroForm.get('name')?.value
            );
            this.heroStore.createHero(heroName);
            this.router.navigate(['/heroes']);
            this.messageService.showMessage('Héroe creado correctamente');
          }
        });
    }
  }

  onEditSubmit(): void {
    if (this.heroForm.valid) {
      this.dialogService
        .openDialog(ConfirmationDialogComponent, {
          data: {
            title: 'Actualizar héroe',
            message: '¿Estas seguro de que quieres actualizar este héroe?',
            confirmText: 'Guardar',
            cancelText: 'Cancelar',
          },
        })
        .afterClosed()
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            const capitalizedName = this.capitalizeWords(
              this.heroForm.get('name')?.value
            );
            const updatedHero: Hero = new Hero(capitalizedName);
            updatedHero.id = this.hero.id;
            this.heroStore.updateHero(updatedHero);
            this.router.navigate(['/heroes']);
            this.messageService.showMessage('Héroe actualizado correctamente');
          }
        });
    }
  }

  //TODO: this method should be in a pipe or service, but for simplicity it's here
  private capitalizeWords(str: string): string {
    if (!str) return '';

    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  }
}
