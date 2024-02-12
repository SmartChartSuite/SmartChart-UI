import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {MatButton} from "@angular/material/button";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {OAuthService} from "angular-oauth2-oidc";
import {RouteState} from "../../models/application-state";
import {window} from "rxjs";

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
export class ContentRootComponent implements OnInit{

  constructor(
    protected stateManagementService: StateManagementService,
    public oauthService: OAuthService) {}

  protected readonly window = window;

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.CONTENT_ROOT);
  }
}
