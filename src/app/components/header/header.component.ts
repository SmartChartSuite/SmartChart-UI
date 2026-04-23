import {Component, inject} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {ConfigService} from "../../services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";
import {Router} from "@angular/router";
import {NgClass} from "@angular/common";
import {LoginComponent} from "../login/login.component";

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    MatTooltip,
    NgClass,
    LoginComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  configService = inject(ConfigService);
  oauthService = inject(OAuthService);
  router = inject(Router);

  currentRoute: string = '';

  protected onPathSelected(path: string) {
    this.router.navigate([path]);
    this.currentRoute = path;
  }

  protected onLogout() {
    this.oauthService.logOut();
  }
}
