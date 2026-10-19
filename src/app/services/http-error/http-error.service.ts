import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  // Private writable signals
  private readonly _errorMessage = signal<string>('');
  private readonly _errorDetected = signal<boolean>(false);

  // Public readonly signals for reading
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly errorDetected = this._errorDetected.asReadonly();

  // Public setter methods
  setErrorMessage(message: string): void {
    this._errorMessage.set(message);
  }

  setErrorDetected(detected: boolean): void {
    this._errorDetected.set(detected);
  }

  hideErrorComponent(): void {
    this.setErrorDetected(false);
    this.setErrorMessage('');
  }

  showErrorComponent(): void {
    this.setErrorDetected(true);
  }
}
