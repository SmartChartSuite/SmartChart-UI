import { Component } from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {AuthService} from "@auth0/auth0-angular";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-content-root',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './content-root.component.html',
  styleUrl: './content-root.component.scss'
})
export class ContentRootComponent {

  constructor(
    protected stateManagementService: StateManagementService,
    public auth: AuthService) {}

  setState(currentComponent: string) {
    this.stateManagementService.setState({"currentComponent": currentComponent});
  }

  protected readonly window = window;
}
