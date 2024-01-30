import { Component } from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {MatButton} from "@angular/material/button";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {OAuthService} from "angular-oauth2-oidc";

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
    this.stateManagementService.setState({"currentComponent": currentComponent});
  }

  protected readonly window = window;
}
