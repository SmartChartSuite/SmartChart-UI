import { Injectable, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private configService = inject(ConfigService);

  /**
   * Configure OAuth service with Auth0 settings.
   * This should be called once during app initialization.
   */
  configure(): Promise<boolean> {
    this.oauthService.configure(this.configService.authConfig);
    this.oauthService.customQueryParams = this.configService.config.auth.customQueryParams;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    // Load discovery document and attempt login if returning from OAuth callback
    return this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
