import {Component, OnInit} from '@angular/core';
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent implements OnInit{

  constructor(private stateManagementService: StateManagementService){}

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.FORMS);
  }
}
