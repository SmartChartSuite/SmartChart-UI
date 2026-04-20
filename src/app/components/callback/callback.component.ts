import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {ApplicationState, RouteState} from "../../models/application-state";
import {Router} from "@angular/router";

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html',
    styleUrl: './callback.component.scss',
})
export class CallbackComponent implements OnInit {

  constructor(protected stateManagementService: StateManagementService,
              private router: Router) {}

  ngOnInit(): void {
    // The OAuth service should have already processed the callback in the login component
    // via loadDiscoveryDocumentAndTryLogin(), so we just need to navigate
    this.readState();
  }

  readState() {
    this.stateManagementService.getState().subscribe({
      next: (value: ApplicationState) => {
        const lastComponent = value.currentRoute;
        // TODO: Navigate to lastComponent
        if (lastComponent === RouteState.LANDING) {
          this.router.navigateByUrl("")
        }

      }
    });
  }


}
