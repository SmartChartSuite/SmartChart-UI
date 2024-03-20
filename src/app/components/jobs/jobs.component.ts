import {Component, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {RouteState} from "../../models/application-state";

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnInit{

  constructor(
    protected stateManagementService: StateManagementService,
  ) {
  }
  ngOnInit() {
    this.stateManagementService.setCurrentRoute(RouteState.JOBS);
  }

}
