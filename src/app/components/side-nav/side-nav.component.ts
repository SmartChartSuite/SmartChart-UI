import {Component, EventEmitter, Output} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import  packageInfo from 'package.json';
import { NgClass } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrl: './side-nav.component.scss',
    imports: [NgClass, LoginComponent, MatIcon, MatTooltip]
})
export class SideNavComponent{

  @Output() expandedStatusChangedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  expanded: boolean = true;
  protected readonly RouteState = RouteState;
  version = packageInfo.version;
  currentRoute: string = '';

  constructor(
    public oauthService: OAuthService,
    public stateManagementService: StateManagementService,
    public router: Router
  ) {
  }

  onExpandedStatusChanged(){
    this.expanded = !this.expanded;
    this.expandedStatusChangedEvent.emit(this.expanded);
  }

  onPathSelected(path: string){
    this.router.navigate([path]);
    this.currentRoute = path;
  }
}
