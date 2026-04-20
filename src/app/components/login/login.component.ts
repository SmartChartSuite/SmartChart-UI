import {Component, Input} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {JwksValidationHandler} from "angular-oauth2-oidc-jwks";
import {ConfigService} from "../../services/config/config.service";
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'sc-standalone-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatButton, MatIcon]
})
export class LoginComponent {
  @Input({ required: true }) isLocatedInMainMenu!: boolean;

  constructor(public oauthService: OAuthService, public configService: ConfigService) {
    this.configure();
  }

  private configure() {
    // Load information from Auth0 (could also be configured manually)
    this.oauthService.configure(this.configService.authConfig);
    this.oauthService.customQueryParams = this.configService.config.auth.customQueryParams;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
