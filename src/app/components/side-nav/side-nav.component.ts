import {Component, EventEmitter, Output} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {

  @Output() expandedStatusChangedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  expanded: boolean = false;
  constructor(
    public oauthService: OAuthService
  ) {
  }

  onExpandedStatusChanged(){
    this.expanded = !this.expanded;
    this.expandedStatusChangedEvent.emit(this.expanded)
  }

}
