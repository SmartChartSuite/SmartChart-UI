import {Component, OnInit} from '@angular/core';
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-form-manager',
  templateUrl: './form-manager.component.html',
  styleUrl: './form-manager.component.scss'
})
export class FormManagerComponent implements OnInit{
  selectedTabIndex: number = 0;

  constructor(
    private stateManagementService: StateManagementService,
    private formManagerService: FormManagerService
    ){}

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.FORM_MANAGER);

    //Select Active Forms tab when the new job is started
    this.formManagerService.formStarted$.subscribe(()=> this.selectedTabIndex = 0)
  }
}
