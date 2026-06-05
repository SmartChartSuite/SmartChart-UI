import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorService } from '../services/http-error/http-error.service';

export const BYPASS_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const httpErrorService = inject(HttpErrorService);

  // Hide error component on new request
  httpErrorService.hideErrorComponent();

  // Check if this request should bypass the interceptor
  if (req.context.get(BYPASS_INTERCEPTOR)) {
    return next(req);
  }

  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Server error occurred';

      // Check if error response contains a FHIR OperationOutcome
      if (error.error?.resourceType === 'OperationOutcome' && error.error?.issue) {
        // Extract diagnostics from all issues
        const diagnostics = error.error.issue
          .map((issue: any) => issue.diagnostics || issue.code)
          .filter((msg: string) => msg)
          .join('; ');

        errorMessage = diagnostics || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      httpErrorService.showErrorComponent();
      httpErrorService.setErrorMessage(errorMessage);
      httpErrorService.setErrorDetected(true);
      return throwError(() => error);
    })
  );
};
