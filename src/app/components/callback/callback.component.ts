import { Component } from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {ApplicationState} from "../../models/application-state";

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent {

  constructor(protected stateManagementService: StateManagementService) {}

  readState() {
    this.stateManagementService.getState().subscribe({
      next: (value: ApplicationState) => {
        const lastComponent = value.currentComponent;
        // TODO: Navigate to lastComponent
      }
    });
  }


}
