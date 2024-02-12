import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {ApplicationState, RouteState} from "../../models/application-state";
import {Router} from "@angular/router";

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {

  constructor(protected stateManagementService: StateManagementService,
              private router: Router) {}

  ngOnInit(): void {}

  readState() {
    this.stateManagementService.getState().subscribe({
      next: (value: ApplicationState) => {
        const lastComponent = value.currentRoute;
        // TODO: Navigate to lastComponent
        if (lastComponent === RouteState.CONTENT_ROOT) {
          this.router.navigateByUrl("")
        }

      }
    });
  }


}
