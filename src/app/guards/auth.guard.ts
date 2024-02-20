import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import {OAuthService} from "angular-oauth2-oidc";

// Solution based on post https://stackoverflow.com/questions/75564717/angulars-canactivate-interface-is-deprecated-how-to-replace-it
@Injectable({
  providedIn: 'root'
})
class PermissionsService {

  constructor(private router: Router, private oauthService: OAuthService, ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.oauthService.hasValidAccessToken();
  }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}
