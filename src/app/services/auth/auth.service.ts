import { Injectable, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private configService = inject(ConfigService);
  private sessionService = inject(SessionService);

  /**
   * Configure OAuth service with Auth0 settings.
   * This should be called once during app initialization.
   */
  configure(): Promise<boolean> {
    this.oauthService.configure(this.configService.authConfig);
    this.oauthService.customQueryParams = this.configService.config.auth?.customQueryParams;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    // React to failed silent refreshes / terminated sessions by redirecting to
    // login, so an expired Auth0 session doesn't leave the user stranded on a
    // page with a soon-to-be-invalid token.
    this.sessionService.monitorSession();

    // Configure resource server settings for the interceptor
    if (this.configService.oAuthModuleConfig?.resourceServer) {
      this.oauthService.setupAutomaticSilentRefresh();
    }

    // Load discovery document and attempt login if returning from OAuth callback
    return this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
