import {Component, input, output} from '@angular/core';
import {ErrorMessage} from '../../models/error-message';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
})
export class ErrorMessageComponent {
  readonly error = input<ErrorMessage | null>(null);
  readonly dismissible = input(false);
  readonly dismissed = output<void>();
}
