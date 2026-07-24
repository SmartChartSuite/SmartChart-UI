import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {ApplicationState, RouteState} from "../../models/application-state";
import {Router} from "@angular/router";

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './callback.component.scss',
})
export class CallbackComponent implements OnInit {

  constructor(protected stateManagementService: StateManagementService,
              private router: Router) {}

  ngOnInit(): void {
    // The OAuth service should have already processed the callback during app initialization
    // via AuthService.configure(), so we just need to navigate
    this.readState();
  }

  readState() {
    this.stateManagementService.getState().subscribe({
      next: (value: ApplicationState) => {
        const lastComponent = value.currentRoute;

        // Navigate to lastComponent based on the stored route state
        if (lastComponent === RouteState.LANDING) {
          this.router.navigateByUrl("");
        } else if (lastComponent === RouteState.FORM_MANAGER) {
          this.router.navigateByUrl("/forms");
        } else if (lastComponent === RouteState.CURRENT_FORM) {
          this.router.navigateByUrl("/form-viewer");
        } else if (lastComponent === RouteState.JOBS_FORMS) {
          this.router.navigateByUrl("/jobs-forms");
        } else {
          // Default fallback
          this.router.navigateByUrl("");
        }
      }
    });
  }
}
