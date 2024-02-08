import {Component, OnInit} from '@angular/core';
import {ConfigService} from "./services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "./services/state-management/state-management.service";
import {ApplicationState, RouteState} from "./models/application-state";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '';
  currentRoute: RouteState | undefined; // TODO: REMOVE
  constructor(
    config: ConfigService,
    public oauthService: OAuthService,
    private applicationState: StateManagementService
  ) {
    this.title = config.config.title;
    this.applicationState.getState().subscribe({
      next: value => {
        this.currentRoute = value.currentRoute; // TODO: REMOVE
      }
    })
  }

}
