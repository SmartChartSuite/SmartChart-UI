import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessage } from '../../models/error-message';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  /** Error shown by the root application outlet when no modal is active. */
  private readonly _globalErrorMessage = signal<ErrorMessage | null>(null);

  /** Error shown by the optional modal outlet while a modal scope is active. */
  private readonly _modalErrorMessage = signal<ErrorMessage | null>(null);

  /** Number of active modal consumers that currently own error presentation. */
  private activeModalScopes = 0;

  /** Read-only signals consumed by the global and modal error outlets. */
  readonly globalErrorMessage = this._globalErrorMessage.asReadonly();
  readonly modalErrorMessage = this._modalErrorMessage.asReadonly();

  /**
   * Normalizes an HTTP error and routes it to the active presentation scope.
   * Modal errors take precedence while at least one modal scope is active.
   */
  showError(
    error: unknown,
    fallback = 'An unexpected error occurred',
    title = 'Server Error'
  ): void {
    const errorMessage: ErrorMessage = {
      title,
      message: this.getErrorMessage(error, fallback)
    };

    if (this.activeModalScopes > 0) {
      this._modalErrorMessage.set(errorMessage);
      return;
    }

    this._globalErrorMessage.set(errorMessage);
  }

  /**
   * Activates modal error routing and returns the matching cleanup function.
   * The cleanup function should be registered with the modal's DestroyRef.
   */
  activateModalErrorScope(): () => void {
    this.activeModalScopes++;
    this.clearModalError();

    return () => {
      this.activeModalScopes = Math.max(0, this.activeModalScopes - 1);
      if (this.activeModalScopes === 0) {
        this.clearModalError();
      }
    };
  }

  /** Clears the error displayed by the root application outlet. */
  clearGlobalError(): void {
    this._globalErrorMessage.set(null);
  }

  /** Clears the error displayed by the active modal outlet. */
  clearModalError(): void {
    this._modalErrorMessage.set(null);
  }

  /**
   * Extracts a user-facing message from an OperationOutcome, response body,
   * Angular error, or the supplied fallback, in that order.
   */
  getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
    if (error instanceof HttpErrorResponse) {
      const responseBody = error.error as {
        resourceType?: string;
        issue?: Array<{ diagnostics?: string; code?: string }>;
        message?: string;
      } | string | null | undefined;

      if (typeof responseBody === 'object' && responseBody?.resourceType === 'OperationOutcome') {
        const diagnostics = responseBody.issue
          ?.map(issue => issue.diagnostics || issue.code)
          .filter((message): message is string => Boolean(message))
          .join('; ');

        if (diagnostics) {
          return diagnostics;
        }
      }

      if (typeof responseBody === 'object' && responseBody?.message) {
        return responseBody.message;
      }

      if (typeof responseBody === 'string' && responseBody) {
        return responseBody;
      }

      if (error.message) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }
}
