import {Component} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {MatButton} from "@angular/material/button";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {OAuthService} from "angular-oauth2-oidc";
import {RouteState} from "../../models/application-state";

@Component({
  selector: 'app-content-root',
  standalone: true,
  imports: [
    MatButton,
    AsyncPipe,
    JsonPipe,
  ],
  templateUrl: './content-root.component.html',
  styleUrl: './content-root.component.scss'
})
export class ContentRootComponent {

  constructor(
    protected stateManagementService: StateManagementService,
    public oauthService: OAuthService) {}

  setState(currentComponent: string) {
    // TODO: Call this in lifecycle, need to establish precisely when. Init is likely not right.
    this.stateManagementService.setCurrentRoute(RouteState.CONTENT_ROOT);
  }

  protected readonly window = window;
}
