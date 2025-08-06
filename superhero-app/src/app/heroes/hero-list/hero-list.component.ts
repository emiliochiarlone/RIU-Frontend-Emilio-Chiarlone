import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { Hero } from '@core/models/hero.model';
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
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeroStore } from '@core/services/heroes/hero.store';
import { LoadingService } from '@core/services/loading.service';
import { DialogService } from '@core/services/dialog.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent {
  heroStore = inject(HeroStore);
  router = inject(Router);

  paginatorFormatterService = inject(PaginatorFormatterService);
  dialogService = inject(DialogService);
  snackBar = inject(MatSnackBar);
  loadingService = inject(LoadingService)

  heroes = this.heroStore.filteredHeroes;
  storeLoading = this.heroStore.isLoading;
  heroCount = this.heroStore.heroCount;
  errorMessage = this.heroStore.errorMessage;
  errorCode = this.heroStore.errorCode;

  searchControl: FormControl<string | null> = new FormControl<string>('');
  subscriptions: Subscription[] = [];
  showSearchSpinner = signal<boolean>(false);
  globalLoading = this.loadingService.isLoading;


  @ViewChild('heroPaginator') paginator!: MatPaginator;
  displayedColumns: string[] = ['id', 'name', 'actions'];
  heroDataSource: MatTableDataSource<Hero> = new MatTableDataSource<Hero>([]);
  defaultPageSize = 5;

  constructor() {
    effect(() => {
      if (this.heroes()) {
        this.setHeroDataSource();
      }
    });

    effect(() => {
      if (this.errorMessage() || this.errorCode()) {
        this.snackBar.open('Error: ' + this.errorMessage(), 'Cerrar', {
          duration: 2500,
        });
        this.heroStore.clearError();
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
          switchMap((value: string | null) => {
            this.executeSearchByName(value);
            return of(value).pipe(
              delay(500),
              tap(() => this.showSearchSpinner.set(false))
            );
          })
        ).subscribe()
    );
  }

  ngAfterViewInit(): void {
    this.executeSearchByName('');
    this.paginatorFormatterService.format(this.paginator);
    this.setHeroDataSource();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setHeroDataSource(): void {
    this.heroDataSource.data = this.heroes();
    if (!this.heroDataSource.paginator) {
      this.heroDataSource.paginator = this.paginator;
    }
  }

  onEditClick(heroId: number): void {
    this.router.navigate(['/heroes/edit', heroId]);
  }

  onDeleteClick(id: number): void {
    const dialogRef = this.dialogService.openDialog(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmar eliminar héroe',
        message: '¿Estás seguro de que deseas eliminar este héroe?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.heroStore.deleteHero(id);
        this.snackBar.open('Héroe eliminado correctamente', 'Cerrar', {
          duration: 2500,
        });
      }
    });
  }

  executeSearchByName(name: string | null): void {
    this.heroStore.findByName(name || '')
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
