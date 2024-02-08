import {Component, OnInit} from '@angular/core';
import {ConfigService} from "./services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '';
  isExpanded = false;

  constructor(
    config: ConfigService,
    public oauthService: OAuthService
  ) {
    this.title = config.config.title;
  }

}
