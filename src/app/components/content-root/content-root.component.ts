import { Component } from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";

@Component({
  selector: 'app-content-root',
  standalone: true,
  imports: [],
  templateUrl: './content-root.component.html',
  styleUrl: './content-root.component.scss'
})
export class ContentRootComponent {

  constructor(protected stateManagementService: StateManagementService) {}

  setState(currentComponent: string) {
    this.stateManagementService.setState({"currentComponent": currentComponent});
  }
}
