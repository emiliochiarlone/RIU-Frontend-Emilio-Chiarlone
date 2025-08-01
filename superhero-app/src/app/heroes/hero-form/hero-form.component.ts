import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { Hero } from '@core/models/hero.model';
import { MaterialModule } from '@shared/material/material.module';
import { HeroService } from '@core/services/heroes/hero.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UppercaseDirective } from '@shared/directives/uppercase.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from '@core/services/loading.service';
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
  heroService = inject(HeroService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  loadingService = inject(LoadingService);

  loading = computed(() => this.loadingService.loading());
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
          Validators.pattern('^[a-zA-Z0-9 ]+$'),
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
    this.heroService.getById(id).subscribe({
      next: (hero: Hero) => {
        this.hero = hero;
        if (this.heroForm) this.heroForm.get('name')?.setValue(this.hero.name);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar hroe: ' + error.message, 'Cerrar', {
          duration: 2500,
        });
        this.router.navigate(['/heroes']);
      },
    });
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
      this.dialog
        .open(ConfirmationDialogComponent, {
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
            this.heroService
              .create(this.capitalizeWords(this.heroForm.get('name')?.value))
              .subscribe({
                next: (hero: Hero) => {
                  this.router.navigate(['/heroes']);
                  this.snackBar.open('Héroe creado correctamente.', 'Cerrar', {
                    duration: 2500,
                  });
                },
                error: (error) => {
                  this.snackBar.open(
                    'Error al crear el héroe: ' + error.message,
                    'Cerrar',
                    {
                      duration: 2500,
                    }
                  );
                },
              });
          }
        });
    }
  }

  onEditSubmit(): void {
    if (this.heroForm.valid) {
      this.dialog
        .open(ConfirmationDialogComponent, {
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
            this.hero.name = this.capitalizeWords(
              this.heroForm.get('name')?.value
            );
            this.heroService.update(this.hero).subscribe({
              next: (hero: Hero) => {
                this.router.navigate(['/heroes']);
                this.snackBar.open(
                  'Héroe actualizado correctamente.',
                  'Cerrar',
                  {
                    duration: 2500,
                  }
                );
              },
              error: (error) => {
                this.snackBar.open(
                  'Error al actualizar el héroe: ' + error.message,
                  'Cerrar',
                  {
                    duration: 2500,
                  }
                );
              },
            });
          }
        });
    }
  }

  //this method should be in a pipe or service, but for simplicity it's here
  private capitalizeWords(str: string): string {
    if (!str) return '';

    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  }
}
