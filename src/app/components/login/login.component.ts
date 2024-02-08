import {Component, Input} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {JwksValidationHandler} from "angular-oauth2-oidc-jwks";
import {authCodeFlowConfig} from "../../../assets/config/auth-code-flow-config";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {NgIf} from "@angular/common";
@Component({
  selector: 'sc-standalone-login',
  standalone: true,
  imports: [
    MatIcon,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    NgIf,
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Input({ required: true }) isLocatedInMainMenu!: boolean;
  constructor(public oauthService: OAuthService) {
    this.configure();
  }

  private configure() {
    // Load information from Auth0 (could also be configured manually)
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
