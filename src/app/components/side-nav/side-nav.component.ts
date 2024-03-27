import {Component, EventEmitter, Output} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent{

  @Output() expandedStatusChangedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  expanded: boolean = false;
  protected readonly RouteState = RouteState;

  constructor(
    public oauthService: OAuthService,
    public stateManagementService: StateManagementService,
    public router: Router
  ) {
    this.stateManagementService.getState().subscribe((value=> console.log(value)))
  }

  onExpandedStatusChanged(){
    this.expanded = !this.expanded;
    this.expandedStatusChangedEvent.emit(this.expanded);
  }

}
