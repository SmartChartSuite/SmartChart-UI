import {Component, OnInit} from '@angular/core';
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { StartNewFormComponent } from './start-new-form/start-new-form.component';
import { ActiveFormsComponent } from './active-forms/active-forms.component';

@Component({
    selector: 'app-form-manager',
    templateUrl: './form-manager.component.html',
    styleUrl: './form-manager.component.scss',
    imports: [MatTabGroup, MatTab, StartNewFormComponent, ActiveFormsComponent]
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
