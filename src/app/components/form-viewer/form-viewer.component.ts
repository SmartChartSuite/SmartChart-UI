//TODO: extract to proper location
import {ActiveFormSummary} from "../../models/active-form-summary";

export enum QuestionWidgetType{
  RADIO = 'choice',
  INPUT = 'string',
}


import {Component, OnDestroy, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, mergeMap, Observable, switchMap, take, takeLast, tap} from "rxjs";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit, OnDestroy {

  temp_for_demo: any;
  QuestionWidgetType = QuestionWidgetType;
  showDrawer = false;
  activeFormSummary: ActiveFormSummary;
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;
  selectedActiveFormSummary$: Observable<ActiveFormSummary>;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    public router: Router,
    private stateManagementService: StateManagementService
  ) {}

  ngOnDestroy(): void {
    //TODO Maybe we need to save the current state of the form so the user can go back and forward?
  }

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);
    this.formManagerService.selectedActiveFormSummary$.pipe(
      tap(value => this.activeFormSummary = value),
      filter(value => !!this.activeFormSummary),
      mergeMap(value=> this.rcApiInterfaceService.getJobPackage(value?.formName))
    ).subscribe({
      next: result => {
        result['item'] = result['item']?.map((item: any) => {return {...item, answer: null}});
        result['item'] = result['item']?.map((item: any, index: number) => {
          return index == 0 ? {...item, selected: true} : {...item, selected: false}
        });
        this.temp_for_demo = result;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  selectQuestionnaireSection(item: any, index: number) {
    this.selectedMenuItemIndex = index;
    this.temp_for_demo['item'] = this.temp_for_demo.item.map((element: any) => element == item ? {...element, selected: true}: {...element, selected: false});
  }

  onSubmit() {
    console.log(this.temp_for_demo)
  }

  selectPatientForm() {
    this.router.navigate(['/forms']);
  }

  onViewEvidence(childItem: any, index: number) {
    this.selectedEvidenceIndex = index;
    //TODO wire show evidence call here
  }
}
