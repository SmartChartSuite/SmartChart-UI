import {Component, computed, inject, input} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {JwksValidationHandler} from "angular-oauth2-oidc-jwks";
import {ConfigService} from "../../services/config/config.service";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {ButtonModule} from "primeng/button";
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDivider} from "@angular/material/list";
@Component({
  selector: 'sc-standalone-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    MatCardModule,
    MatIconModule,
    ButtonModule,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatMenuItem,
  ]
})
export class LoginComponent {

  isLocatedInMainMenu = input.required<boolean>();
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
