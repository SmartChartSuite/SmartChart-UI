import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {OAuthService} from "angular-oauth2-oidc";
import {RouteState} from "../../models/application-state";
import {window} from "rxjs";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit{

  constructor(
    protected stateManagementService: StateManagementService,
    public oauthService: OAuthService) {}

  protected readonly window = window;

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.LANDING);
  }
}
