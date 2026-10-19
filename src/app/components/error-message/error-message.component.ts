import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {HttpErrorService} from '../../services/http-error/http-error.service';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error-message.component.scss',
})
export class ErrorMessageComponent {
  private readonly httpErrorService = inject(HttpErrorService);

  // Expose service signals to template
  protected readonly errorMessage = this.httpErrorService.errorMessage;
  protected readonly errorDetected = this.httpErrorService.errorDetected;
}
