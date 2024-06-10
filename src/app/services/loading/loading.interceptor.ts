import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import {SkipLoading} from "./skip-loading";
import {LoadingService} from "./loading.service";
import {finalize, Observable} from "rxjs";

@Injectable()
export class LoggingInterceptor implements HttpInterceptor{
  constructor (private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if(req.context.get(SkipLoading)) {
       return next.handle(req);
    }
    this.loadingService.loadingOn();
    return next.handle(req).pipe(finalize(() => {this.loadingService.loadingOff()}))
  }
}
