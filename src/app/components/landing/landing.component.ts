import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {OAuthService} from "angular-oauth2-oidc";
import {RouteState} from "../../models/application-state";
import {window} from "rxjs";
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, RouterLink, MatDivider]
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
