import {Component, Input} from '@angular/core';
import {JwksValidationHandler, OAuthService} from "angular-oauth2-oidc";
import {ConfigService} from "../../services/config/config.service";
@Component({
  selector: 'sc-standalone-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Input({ required: true }) isLocatedInMainMenu!: boolean;
  constructor(public oauthService: OAuthService, public configService: ConfigService,
  ) {
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
