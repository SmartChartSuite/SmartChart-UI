import {ActiveFormSummary} from "../../models/active-form-summary";
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, interval, mergeMap, Observable, ReplaySubject, share, switchMap, takeWhile, tap, timer} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
import { TIMEZONES } from '../../../assets/const/timezones';
import {FormAnswers} from "../../models/form-answers";
import {FormOutputMappingService} from "../../services/form-output-mapping/form-output-mapping.service";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit, OnDestroy {
  protected readonly QuestionnaireItemType = QuestionnaireItemType;
  answerDictionary: FormAnswers;
  questionnaire: any;
  showDrawer = false;
  activeFormSummary: ActiveFormSummary;
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;
  readonly TIMEZONES = TIMEZONES;

  results: Results;
  evidenceViewerExpanded$: Observable<boolean>;

  // Refresh Evidence Trigger
  refreshTrigger$ = new ReplaySubject(1);
  status: string = "fetching"; // Initial State
  completeCount: number = 0; // Initial State
  totalCount: number = 0; // Initial State
  percentComplete: number = 0; // Initial State

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    public router: Router,
    private stateManagementService: StateManagementService,
    private utilsService: UtilsService,
    public evidenceViewerService: EvidenceViewerService,
    private outputMapper: FormOutputMappingService
  ) {
  }

  ngOnDestroy(): void {
    //TODO Maybe we need to save the current state of the form so the user can go back and forward?
  }

  ngOnInit(): void {
    // Results Handling
    // let results$ = this.refreshTrigger$.pipe(
    //   switchMap(() => this.fetchResults()),
    //   share()
    // );

    let results$ = timer(0,10000).pipe(
      takeWhile(() => !!this.activeFormSummary),
      takeWhile(() => !this.results || this.results?.status !== "complete"),
      switchMap(() => this.fetchResults()),
      share()
    )
    results$.subscribe(value => this.results = value);

    this.evidenceViewerExpanded$ = this.evidenceViewerService.viewerExpanded$;
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);
    let activeFormSummary$ = this.formManagerService.selectedActiveFormSummary$.pipe(
      tap(value => this.activeFormSummary = value),
      filter(value => !!value),
      mergeMap(value=> this.rcApiInterfaceService.getJobPackage(value?.formName))
    );

    activeFormSummary$.subscribe({
      next: result => { //TODO all properties should we accessed with '.' result.item instead of '[]'
        result['item'] = result['item']?.map((item: any, index: number) => {
          return index == 0 ? {...item, selected: true} : {...item, selected: false}
        });
        this.questionnaire = result;
        this.answerDictionary = new FormAnswers(this.questionnaire);
        this.refreshTrigger$.next(1);
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    });

    // Expand the evidence viewer for a larger screen device. This may need a bit of testing
    this.evidenceViewerService.setViewerExpanded(window.screen.width >= 1440);
  }

  fetchResults() {
    return this.rcApiInterfaceService.getBatchJobResults(this.activeFormSummary.batchId).pipe(
      tap(value => this.status = value.status),
      tap(value => this.completeCount = value.completeJobs),
      tap(value => this.totalCount = value.totalJobs),
      tap(value => this.percentComplete = value.completeJobs / value.totalJobs * 100)
    );
  }

  selectQuestionnaireSection(index: number) {
    this.selectedMenuItemIndex = index;
    this.questionnaire['item'] = this.questionnaire.item.map((element: any, i) => i == this.selectedMenuItemIndex ? {...element, selected: true}: {...element, selected: false});
    //TODO implement scroll to top when new question is selected
  }

  onSubmit() {
    console.info("Logging Questionnaire Responses");
    console.info(this.answerDictionary);
    this.outputMapper.mapToFhir(this.answerDictionary, this.questionnaire);
  }

  selectPatientForm() {
    this.router.navigate(['/forms']);
  }
  setValue(questionType: QuestionnaireItemType, questionnaire: any, i: number, j: number) {
    if(questionType == QuestionnaireItemType.integer && questionnaire.item[i].item[j].answer){
       questionnaire.item[i].item[j].answer = Math.trunc(questionnaire.item[i].item[j].answer);
    }
  }
}
