//TODO: extract to proper location
import {ActiveFormSummary} from "../../models/active-form-summary";

export enum QuestionWidgetType{
  RADIO = 'choice',
  INPUT = 'string',
  QUANTITY = "quantity"
}


import {Component, OnDestroy, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, mergeMap, Observable, tap} from "rxjs";
import {Results} from "../../models/results";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {UtilsService} from "../../services/utils/utils.service";

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

  results$: Observable<Results>;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    public router: Router,
    private stateManagementService: StateManagementService,
    private utilsService: UtilsService
  ) {
  }

  ngOnDestroy(): void {
    //TODO Maybe we need to save the current state of the form so the user can go back and forward?
  }

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);
    this.formManagerService.selectedActiveFormSummary$.pipe(
      tap(value => this.activeFormSummary = value),
      filter(value => !!value),
      mergeMap(value=> this.rcApiInterfaceService.getJobPackage(value?.formName))
    ).subscribe({
      next: result => { //TODO all properties should we accessed with '.' result.item instead of '[]'
        result['item'] = result['item']?.map((item: any) => {return {...item, answer: null}});
        result['item'] = result['item']?.map((item: any, index: number) => {
          return index == 0 ? {...item, selected: true} : {...item, selected: false}
        });
        this.temp_for_demo = result;
        // TODO : this code needs refactoring since it is using observable which is not
        this.results$ = this.rcApiInterfaceService.getBatchJobResults(this.activeFormSummary.batchId);
        this.results$.subscribe();
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage();
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

  onViewEvidence(evidence: FhirBaseResource[], index: number) {
    this.selectedEvidenceIndex = index;
    //TODO wire show evidence call here
  }
}
