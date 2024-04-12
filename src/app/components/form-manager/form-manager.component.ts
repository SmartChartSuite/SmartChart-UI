import {Component, OnInit} from '@angular/core';
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";

@Component({
  selector: 'app-form-manager',
  templateUrl: './form-manager.component.html',
  styleUrl: './form-manager.component.scss'
})
export class FormManagerComponent implements OnInit{

  constructor(private stateManagementService: StateManagementService){}

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.FORMS);
  }
}
