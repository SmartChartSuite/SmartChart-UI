import {ActiveFormSummary} from "../../models/active-form-summary";
import {Component, ElementRef, OnDestroy, OnInit, signal, ViewChild, ChangeDetectionStrategy, inject, DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, map, mergeMap, Observable, ReplaySubject, share, switchMap, tap} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
import { TIMEZONES } from '../../../assets/const/timezones';
import {FormAnswers} from "../../models/form-answers";
import {FormOutputMappingService} from "../../services/form-output-mapping/form-output-mapping.service";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
import {openExportFileDialog} from "../export-selection-dialog/export-selection-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { PatientDetailsComponent } from "./patient-details/patient-details.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";
import { MatNavList } from "@angular/material/list";
import {NgClass, AsyncPipe, JsonPipe} from "@angular/common";
import { QuestionnaireIndexDirective } from "../../directives/questionnaire-index.directive";
import { MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import { MatFormField, MatLabel, MatHint } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FhirDateTimeComponent } from "../fhir-date-time/fhir-date-time.component";
import { MatChip } from "@angular/material/chips";
import { MatTooltip } from "@angular/material/tooltip";
import { SetEvidenceDirective } from "../../directives/set-evidence.directive";
import { MatIcon } from "@angular/material/icon";
import { EvidenceDetailsComponent } from "./evidence-details/evidence-details.component";
import { SuggestedAnswerFormatterPipe } from "../../pipe/suggested-answer-formatter.pipe";
import { FormattedTitlePipe } from "../../pipe/formatted-title.pipe";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";

export interface Item {
  linkId: string;           // Required FHIR property
  type?: string;            // QuestionnaireItemType
  text?: string;            // Question text
  value?: any;              // Custom property
  item?: Item[];            // Nested items
  answer?: any;             // Answer value
  selected?: boolean;       // Custom property for UI state
  extension?: any[];        // FHIR extensions
  [key: string]: any;       // Allow additional dynamic properties
}

export interface Questionnaire extends FhirBaseResource {
  item: Item[];
}

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    PatientDetailsComponent,
    MatProgressSpinner,
    MatButton,
    MatNavList,
    NgClass,
    QuestionnaireIndexDirective,
    MatRadioGroup,
    FormsModule,
    MatRadioButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatHint,
    FhirDateTimeComponent,
    MatChip,
    MatTooltip,
    SetEvidenceDirective,
    MatIcon,
    EvidenceDetailsComponent,
    AsyncPipe,
    SuggestedAnswerFormatterPipe,
    FormattedTitlePipe,
    JsonPipe,
  ]
})
export class FormViewerComponent implements OnInit, OnDestroy {
  protected readonly QuestionnaireItemType = QuestionnaireItemType;
  answerDictionary = signal<FormAnswers | undefined>(undefined);
  questionnaire = signal<Questionnaire>(undefined);


  showDrawer = false;
  activeFormSummary = signal<ActiveFormSummary | undefined>(undefined);
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;
  readonly TIMEZONES = TIMEZONES;

  results = signal<Results | undefined>(undefined);
  evidenceViewerExpanded$: Observable<boolean>;
  @ViewChild('top') topScroll: ElementRef;

  // Refresh Evidence Trigger
  refreshTrigger$ = new ReplaySubject(1);
  status: string = "fetching"; // Initial State
  completeCount: number = 0; // Initial State
  totalCount: number = 0; // Initial State
  percentComplete: number = 0; // Initial State

  exportTypes: string[] = ['json', 'pdf']

  exportForm = new FormGroup({
    exportType: new FormControl(this.exportTypes[0])
  });

  private destroyRef = inject(DestroyRef);

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    public router: Router,
    private stateManagementService: StateManagementService,
    private utilsService: UtilsService,
    public evidenceViewerService: EvidenceViewerService,
    private outputMapper: FormOutputMappingService,
    private dialog: MatDialog,
  ) {
  }

  ngOnDestroy(): void {
    //TODO Maybe we need to save the current state of the form so the user can go back and forward?
  }

  ngOnInit(): void {
    // Results Handling
    let results$ = this.refreshTrigger$.pipe(
      switchMap(() => this.fetchResults()),
      share()
    );

    // let results$ = timer(0,10000).pipe(
    //   takeWhile(() => !!this.activeFormSummary()),
    //   takeWhile(() => !this.results || this.results?.status !== "complete"),
    //   switchMap(() => this.fetchResults()),
    //   share()
    // )
    results$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => this.results.set(value));

    this.evidenceViewerExpanded$ = this.evidenceViewerService.viewerExpanded$;
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);

    this.formManagerService.selectedActiveFormSummary$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(value => this.activeFormSummary.set(value)),
      filter(value => !!value),
      mergeMap(value => this.rcApiInterfaceService.getJobPackage({
        key: 'name',
        value: value.formName
      })),
      map(response => Array.isArray(response) ? (response[0] ?? null) : response),
      map(result => ({
        ...result,
        item: result?.item?.map((item: any, index: number) => ({
          ...item,
          selected: index === 0
        }))
      }))
    ).subscribe({
      next: result => {
        this.questionnaire.set(result);
        this.answerDictionary.set(new FormAnswers(this.questionnaire()));
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
    const activeForm = this.activeFormSummary();
    return this.rcApiInterfaceService.getBatchJobResults(activeForm!.batchId).pipe(
      tap(value => {console.log(value)}),
      tap(value => this.status = value.status),
      tap(value => this.completeCount = value.completeJobs),
      tap(value => this.totalCount = value.totalJobs),
      tap(value => this.percentComplete = value.completeJobs / value.totalJobs * 100)
    );
  }

  selectQuestionnaireSection(index: number) {
    this.selectedMenuItemIndex = index;
    const currentQuestionnaire = this.questionnaire();
    if (currentQuestionnaire) {
      currentQuestionnaire['item'] = currentQuestionnaire.item.map((element: any, i) => i == this.selectedMenuItemIndex ? {...element, selected: true}: {...element, selected: false});
      this.questionnaire.set(currentQuestionnaire);
    }
  }

  onExport() {
    openExportFileDialog(
      this.dialog,
      {})
      .subscribe(
        exportType => {
          if(exportType == "json"){
            const questionnaireResponse = this.outputMapper.mapQrToFhir(this.answerDictionary(), this.questionnaire(), this.activeFormSummary());
            const blob = new Blob([JSON.stringify(questionnaireResponse)], {type: 'application/json'});
            const link = document.createElement('a');

            link.href = URL.createObjectURL(blob);
            link.download = `FHIR_Question_Response.json`;
            document.body.appendChild(link);
            link.click();
            document.body?.removeChild(link);
            URL.revokeObjectURL(link.href);
          }
          else if (exportType == "pdf"){
            //TODO implement the pdf export
          }
        })
  }

  selectPatientForm() {
    this.router.navigate(['/forms']);
  }
  setValue(questionType: QuestionnaireItemType, questionnaire: any, i: number, j: number) {
    const currentQuestionnaire = this.questionnaire();
    if(questionType == QuestionnaireItemType.integer && currentQuestionnaire?.item[i]?.item[j]?.answer){
       currentQuestionnaire.item[i].item[j].answer = Math.trunc(currentQuestionnaire.item[i].item[j].answer);
       this.questionnaire.set(currentQuestionnaire);
    }
  }

  scrollToTop() {
    this.topScroll.nativeElement.scrollTop = 0;
  }


  protected getQuestionCount(item: Item) {
    console.log(item);
    if(!item || !item.item?.length){
      return 0;
    }
    let questionCount = 0;
    questionCount = item?.item.filter(element => element?.type !='display')?.length || 0;
    return questionCount;
  }

  protected getEvidenceCount(linkId: string, results: Results): number | string {
    if (!results || !linkId) {
      return 'ERROR';
    }
    const evidence = results[`link${linkId}`]?.['evidence'];
    return evidence ? evidence.length : 'ERROR';
  }

  protected getQuestionsWithEvidenceCount(item: Item, results: Results): number {
    if (!item || !item.item?.length || !results) {
      return 0;
    }

    let questionsWithEvidenceCount = 0;

    for (const childItem of item.item) {
      const evidenceCount = this.getEvidenceCount(childItem.linkId, results);
      if (typeof evidenceCount === 'number' && evidenceCount > 0) {
        questionsWithEvidenceCount++;
      }
    }

    return questionsWithEvidenceCount;
  }

  protected onSave() {
    const questionnaireResponse = this.outputMapper.mapQrToFhir(this.answerDictionary(), this.questionnaire(), this.activeFormSummary());
    const batchJobId = this.activeFormSummary().batchId;
    this.rcApiInterfaceService.saveQuestionnaire(questionnaireResponse, batchJobId).subscribe({
      next: (response) => {
        this.utilsService.showSuccessMessage("Form Saved Successfully");
      },
      error: (error) => {
        console.error(error);
        this.utilsService.showErrorMessage("Error Saving Form");
      }
    });
  }


}
