import {Component, computed, inject, input} from '@angular/core';
import {JwksValidationHandler, OAuthService} from "angular-oauth2-oidc";
import {ConfigService} from "../../services/config/config.service";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
@Component({
  selector: 'sc-standalone-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    MatCardModule,
    MatIconModule,
  ]
})
export class LoginComponent {

  isLocatedInMainMenu = input.required<boolean>();
  user = computed(() => this.oauthService.getIdentityClaims());
  public oauthService: OAuthService = inject(OAuthService);
  public configService: ConfigService = inject(ConfigService);

  constructor() {
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
