import {Component, EventEmitter, Output} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import  packageInfo from 'package.json';
@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrl: './side-nav.component.scss',
    standalone: false
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
