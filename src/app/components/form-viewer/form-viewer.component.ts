import {ActiveFormSummary} from "../../models/active-form-summary";
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, mergeMap, Observable, tap} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
import {QuestionType} from "../../models/question-type";
import { TIMEZONES } from '../../../assets/const/timezones';

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit, OnDestroy {

  questionnaire: any;
  QuestionWidgetType = QuestionType;
  showDrawer = false;
  activeFormSummary: ActiveFormSummary;
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;
  readonly TIMEZONES = TIMEZONES;

  results: Results;
  evidenceViewerExpanded$: Observable<boolean>;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    public router: Router,
    private stateManagementService: StateManagementService,
    private utilsService: UtilsService,
    public evidenceViewerService: EvidenceViewerService
  ) {
  }

  ngOnDestroy(): void {
    //TODO Maybe we need to save the current state of the form so the user can go back and forward?
  }

  ngOnInit(): void {

    this.evidenceViewerExpanded$ = this.evidenceViewerService.viewerExpanded$;

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
        this.questionnaire = result;
        this.rcApiInterfaceService.getBatchJobResults(this.activeFormSummary.batchId)
          .subscribe(value=> this.results = value );
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    });

    // Expand the evidence viewer for a larger screen device. This may need a bit of testing
    this.evidenceViewerService.setViewerExpanded(window.screen.width >= 1440);
  }

  selectQuestionnaireSection(index: number) {
    this.selectedMenuItemIndex = index;
    this.questionnaire['item'] = this.questionnaire.item.map((element: any, i) => i == this.selectedMenuItemIndex ? {...element, selected: true}: {...element, selected: false});
    //TODO implement scroll to top when new question is selected
  }

  onSubmit() {
    console.log(this.questionnaire)
  }

  selectPatientForm() {
    this.router.navigate(['/forms']);
  }
  setValue(questionType: QuestionType, questionnaire: any, i: number, j: number) {
    if(questionType == QuestionType.INTEGER && questionnaire.item[i].item[j].answer){
       questionnaire.item[i].item[j].answer = Math.trunc(questionnaire.item[i].item[j].answer);
    }
  }

  onDateTimeUpdated(event: any, questionnaire: any, i: number, j: number) {
    if(event.questionType == QuestionType.DATE){
      questionnaire.item[i].item[j].answer = event.data;
    }
  }
}
