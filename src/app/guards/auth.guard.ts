import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
class PermissionsService {

  constructor(private router: Router, private oauthService: OAuthService) {}

  canActivate(next?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): boolean {
    const hasValidToken = this.oauthService.hasValidAccessToken();

    if (!hasValidToken) {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}
