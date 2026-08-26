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
      // Not authenticated: send the user to login, remembering the page they
      // originally requested so we can return them there after they sign in.
      this.router.navigate(['/login'], {
        queryParams: state?.url ? { returnUrl: state.url } : undefined
      });
      return false;
    }

    return true;
  }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}
