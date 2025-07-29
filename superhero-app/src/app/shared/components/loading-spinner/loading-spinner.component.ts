import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-loading-spinner',
  imports: [MaterialModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {

}
