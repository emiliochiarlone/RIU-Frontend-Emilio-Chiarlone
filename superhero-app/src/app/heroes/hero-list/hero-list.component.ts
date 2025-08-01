import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { Hero } from '@core/models/hero.model';
import { HeroService } from '@core/services/heroes/hero.service';
import { LoadingService } from '@core/services/loading.service';
import { PaginatorFormatterService } from '@core/services/paginator-formatter.service';
import { MaterialModule } from '@shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  finalize,
  Subscription,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-hero-list',
  imports: [
    MaterialModule,
    CommonModule,
    LoadingSpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent {
  heroService = inject(HeroService);
  loadingService = inject(LoadingService);
  router = inject(Router);
  paginatorFormatterService = inject(PaginatorFormatterService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  @ViewChild('heroPaginator') paginator!: MatPaginator;

  heroes = signal<Hero[]>([]);

  searchControl: FormControl<string | null> = new FormControl<string>('');
  showSearchSpinner  = signal<boolean>(false);

  isLoading = computed(() => this.loadingService.loading());
  canShowTable = computed(() => !this.isLoading());

  displayedColumns: string[] = ['id', 'name', 'actions'];
  heroDataSource: MatTableDataSource<Hero> = new MatTableDataSource<Hero>([]);
  defaultPageSize = 5;
  subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      if (this.heroes) {
        this.setHeroDataSource(this.heroes());
      }
    });
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          tap(() => this.showSearchSpinner.set(true)),
        )
        .subscribe((value: string | null) => {
          if (!value || value.trim() === '') {
            this.executeSearch();
          } else {
            this.executeSearchByName(value);
          }
        })
    );
  }

  ngAfterViewInit(): void {
    this.executeSearch();
    this.paginatorFormatterService.format(this.paginator);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setHeroDataSource(heroes: Hero[]): void {
    this.heroDataSource.data = heroes;
    if (!this.heroDataSource.paginator) {
      this.heroDataSource.paginator = this.paginator;
    }
  }

  onEditClick(heroId: number): void {
    this.router.navigate(['/heroes/edit', heroId]);
  }

  onDeleteClick(id: number): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Confirmación de eliminación',
          message: '¿Estás seguro de que deseas eliminar este héroe?',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.heroService.delete(id).subscribe({
            next: () => {
              this.snackBar.open('Heroe eliminado correctamente.', 'Cerrar', {
                duration: 2500,
              });
              this.executeSearch();
            },
            error: (error) => {
              this.snackBar.open(
                'Error al eliminar el heroe: ' + error.message,
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

  executeSearch(): void {
    this.subscriptions.push(
      this.heroService
        .getAll()
        .pipe(
          finalize(() => {
            this.showSearchSpinner.set(false);
          })
        )
        .subscribe((heroes: Hero[]) => {
          this.heroes.set(heroes);
          this.heroDataSource.data = heroes;
        })
    );
  }

  executeSearchByName(name: string | null): void {
    this.subscriptions.push(
      this.heroService
        .findByName(name?.trim() || '')
        .pipe(
          finalize(() => {
            this.showSearchSpinner.set(false);
          })
        )
        .subscribe({
          next: (heroes: Hero[]) => {
            this.heroes.set(heroes);
            this.setHeroDataSource(heroes);
          },
          error: (error) => {
            this.snackBar.open('Error al buscar heroes: ' + error.message);
          },
        })
    );
  }

  onAddClick(): void {
    this.router.navigate(['/heroes/create']);
  }

  getHeroCountMessage(): string {
    return (
      'Mostrando ' +
      (this.paginator.pageIndex * this.paginator.pageSize + 1) +
      ' - ' +
      Math.min(
        (this.paginator.pageIndex + 1) * this.paginator.pageSize,
        this.heroDataSource.data.length
      ) +
      ' de ' +
      this.heroDataSource.data.length +
      ' héroes.'
    );
  }
}
