import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorService } from '../services/http-error/http-error.service';
import { SessionService } from '../services/session/session.service';

export const BYPASS_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const httpErrorService = inject(HttpErrorService);
  const sessionService = inject(SessionService);

  if (req.context.get(BYPASS_INTERCEPTOR)) {
    return next(req);
  }

  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // An expired/invalid session surfaces as a 401 (unauthenticated) or 403
      // (forbidden) from the resource server. Treat these as a session-expiry
      // signal and route the user back to login instead of showing a generic
      // error banner.
      if (error.status === 401 || error.status === 403) {
        sessionService.expireSession();
        return throwError(() => error);
      }

      httpErrorService.showError(error);

      return throwError(() => error);
    })
  );
};
