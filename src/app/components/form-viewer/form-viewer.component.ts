//TODO: extract to proper location
import {ActiveFormSummary} from "../../models/active-form-summary";

export enum QuestionWidgetType{
  RADIO = 'choice',
  INPUT = 'string',
}


import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit {

  temp_for_demo: any;
  QuestionWidgetType = QuestionWidgetType;
  showDrawer = false;
  activeFormSummary: ActiveFormSummary;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private router: Router,
    private stateManagementService: StateManagementService
  ) {}

  getJobPackage(formName: string){
    this.rcApiInterfaceService.getJobPackage(formName).subscribe({
      next: result => {
        result['item'] = result['item']?.map((item: any) => {return {...item, answer: null}});
        result['item'] = result['item']?.map((item: any, index: number) => {
          return index == 0 ? {...item, selected: true} : {...item, selected: false}
        });
        console.log(result);
        this.temp_for_demo = result;
      }
    });
  }

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);
    this.formManagerService.selectedActiveFormSummary$.subscribe(
      value => {
        this.activeFormSummary = value;
        if(this.activeFormSummary){
          this.getJobPackage(this.activeFormSummary.formName);
        }
      }
    )
  }

  selectQuestionerSection(item: any) {
    this.temp_for_demo['item'] = this.temp_for_demo.item.map((element: any) => element == item ? {...element, selected: true}: {...element, selected: false});
  }

  onSubmit() {
    console.log(this.temp_for_demo)
  }

  selectPatientForm() {
    this.router.navigate(['/forms']);
  }
}
