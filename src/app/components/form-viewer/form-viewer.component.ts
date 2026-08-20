import {ActiveFormSummary} from "../../models/active-form-summary";
import {
  Component,
  ElementRef,
  OnInit,
  signal,
  computed,
  viewChild,
  ChangeDetectionStrategy,
  inject,
  DestroyRef
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {filter, map, mergeMap, ReplaySubject, share, switchMap, tap} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
import {TIMEZONES} from '../../../assets/const/timezones';
import {FormAnswers} from "../../models/form-answers";
import {FormOutputMappingService} from "../../services/form-output-mapping/form-output-mapping.service";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import {FormControl, FormGroup, FormsModule} from "@angular/forms";
import {openExportFileDialog} from "../export-selection-dialog/export-selection-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {PatientDetailsComponent} from "./patient-details/patient-details.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";
import {MatNavList} from "@angular/material/list";
import {NgClass} from "@angular/common";
import {QuestionnaireIndexDirective} from "../../directives/questionnaire-index.directive";
import {MatRadioGroup, MatRadioButton} from "@angular/material/radio";
import {MatFormField, MatLabel, MatHint} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FhirDateTimeComponent} from "../fhir-date-time/fhir-date-time.component";
import {MatChip} from "@angular/material/chips";
import {MatTooltip} from "@angular/material/tooltip";
import {SetEvidenceDirective} from "../../directives/set-evidence.directive";
import {MatIcon} from "@angular/material/icon";
import {EvidenceDetailsComponent} from "./evidence-details/evidence-details.component";
import {SuggestedAnswerFormatterPipe} from "../../pipe/suggested-answer-formatter.pipe";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {QuestionnaireResponse} from "../../models/fhir/resources/fhir.questionnaireresponse";

export interface AnswerOption {
  valueString?: string;

  [key: string]: any;
}

export interface Item {
  linkId: string;           // Required FHIR property
  type?: string;            // QuestionnaireItemType
  text?: string;            // Question text
  value?: unknown;          // Custom property
  item?: Item[];            // Nested items
  answer?: unknown;         // Answer value
  selected?: boolean;       // Custom property for UI state
  answerOption?: AnswerOption[];
  extension?: unknown[];    // FHIR extensions

  [key: string]: unknown;   // Allow additional dynamic properties
}

export interface Questionnaire extends FhirBaseResource {
  title?: string;
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
    SuggestedAnswerFormatterPipe,
  ]
})
export class FormViewerComponent implements OnInit {
  private readonly rcApiInterfaceService = inject(RcApiInterfaceService);
  private readonly formManagerService = inject(FormManagerService);
  readonly router = inject(Router);
  private readonly stateManagementService = inject(StateManagementService);
  private readonly utilsService = inject(UtilsService);
  readonly evidenceViewerService = inject(EvidenceViewerService);
  private readonly outputMapper = inject(FormOutputMappingService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly QuestionnaireItemType = QuestionnaireItemType;
  readonly TIMEZONES = TIMEZONES;

  answerDictionary = signal<FormAnswers | undefined>(undefined);
  questionnaire = signal<Questionnaire | undefined>(undefined);
  questionnaireResponseId = '';

  showDrawer = false;
  activeFormSummary = signal<ActiveFormSummary | undefined>(undefined);
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;

  results = signal<Results | undefined>(undefined);
  evidenceViewerExpanded = toSignal(this.evidenceViewerService.viewerExpanded$, {initialValue: false});

  private readonly topScroll = viewChild<ElementRef<HTMLElement>>('top');

  // Refresh Evidence Trigger
  private readonly refreshTrigger$ = new ReplaySubject<number>(1);
  status = 'fetching'; // Initial State
  completeCount = 0; // Initial State
  totalCount = 0; // Initial State
  percentComplete = 0; // Initial State

  exportTypes: string[] = ['json', 'pdf'];

  exportForm = new FormGroup({
    exportType: new FormControl(this.exportTypes[0])
  });

  ngOnInit(): void {
    // Results Handling
    const results$ = this.refreshTrigger$.pipe(
      switchMap(() => this.fetchResults()),
      share()
    );

    results$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => this.results.set(value));

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
      map((result: Questionnaire | null) => result ? {
        ...result,
        item: result.item?.map((item, index) => ({
          ...item,
          selected: index === 0
        }))
      } : null)
    ).subscribe({
      next: result => {
        this.questionnaire.set(result ?? undefined);
        this.answerDictionary.set(new FormAnswers(this.questionnaire()));
        this.refreshTrigger$.next(1);
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    });

    // Populate answers whenever a QuestionnaireResponse is available. Note the
    // BehaviorSubject emits its current value to new subscribers, so this also
    // covers the case where a response was set before this component loaded.
    this.formManagerService.selectedFormQuestionnaireResponse$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((qr): qr is QuestionnaireResponse => !!qr)
    ).subscribe(questionnaireResponse => {
      this.questionnaireResponseId = questionnaireResponse.id;
      this.populateAnswersFromQuestionnaireResponse(questionnaireResponse);
    });

    // Expand the evidence viewer for a larger screen device. This may need a bit of testing
    this.evidenceViewerService.setViewerExpanded(window.screen.width >= 1440);
  }

  private fetchResults() {
    const activeForm = this.activeFormSummary();
    return this.rcApiInterfaceService.getBatchJobResults(activeForm!.batchId).pipe(
      tap(value => {
        this.status = value.status;
        this.completeCount = value.completeJobs;
        this.totalCount = value.totalJobs;
        this.percentComplete = value.completeJobs / value.totalJobs * 100;
      })
    );
  }

  selectQuestionnaireSection(index: number): void {
    this.selectedMenuItemIndex = index;
    this.questionnaire.update(current => current ? {
      ...current,
      item: current.item.map((element, i) => ({
        ...element,
        selected: i === index
      }))
    } : current);
  }

  onSectionSelected(index: number): void {
    this.selectQuestionnaireSection(index);
    this.selectedEvidenceIndex = null;
    this.showDrawer = false;
    this.scrollToTop();
  }

  goToPreviousSection(): void {
    this.selectQuestionnaireSection(this.selectedMenuItemIndex - 1);
    this.scrollToTop();
  }

  goToNextSection(): void {
    this.selectQuestionnaireSection(this.selectedMenuItemIndex + 1);
    this.scrollToTop();
  }

  toggleEvidenceDrawer(index: number): void {
    this.showDrawer = !(this.selectedEvidenceIndex === index && this.showDrawer);
    this.selectedEvidenceIndex = index;
  }

  onExport(): void {
    openExportFileDialog(this.dialog, {})
      .subscribe(exportType => {
        if (exportType === 'json') {
          const questionnaireResponse = this.outputMapper.mapQrToFhir(
            this.answerDictionary(), this.questionnaire(), this.activeFormSummary());
          const blob = new Blob([JSON.stringify(questionnaireResponse)], {type: 'application/json'});
          const link = document.createElement('a');

          link.href = URL.createObjectURL(blob);
          link.download = `FHIR_Question_Response.json`;
          document.body.appendChild(link);
          link.click();
          document.body?.removeChild(link);
          URL.revokeObjectURL(link.href);
        } else if (exportType === 'pdf') {
          //TODO implement the pdf export
        }
      });
  }

  selectPatientForm(): void {
    this.router.navigate(['/forms']);
  }

  setValue(questionType: QuestionnaireItemType, i: number, j: number): void {
    if (questionType !== QuestionnaireItemType.integer) {
      return;
    }
    this.questionnaire.update(current => {
      const answer = current?.item?.[i]?.item?.[j]?.answer;
      if (current && answer != null) {
        const next = structuredClone(current);
        next.item[i].item![j].answer = Math.trunc(answer as number);
        return next;
      }
      return current;
    });
  }

  scrollToTop(): void {
    const el = this.topScroll()?.nativeElement;
    if (el) {
      el.scrollTop = 0;
    }
  }

  protected getQuestionCount(item: Item): number {
    if (!item || !item.item?.length) {
      return 0;
    }
    return item.item.filter(element => element?.type !== 'display').length;
  }

  protected getEvidenceCount(linkId: string, results: Results | undefined): number | string {
    if (!results || !linkId) {
      return 'ERROR';
    }
    const evidence = results[`link${linkId}`]?.['evidence'];
    return evidence ? evidence.length : 'ERROR';
  }

  protected getQuestionsWithEvidenceCount(item: Item, results: Results | undefined): number {
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

  protected onSave(): void {
    const questionnaireResponse = this.outputMapper.mapQrToFhir(
      this.answerDictionary(), this.questionnaire(), this.activeFormSummary());
    this.rcApiInterfaceService.updateQuestionnaireResponse(questionnaireResponse, this.questionnaireResponseId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.utilsService.showSuccessMessage("Form Saved Successfully");
      },
      error: (error) => {
        console.error(error);
        this.utilsService.showErrorMessage("Error Saving Form");
      }
    });
  }

  /**
   * Populates the form answers from a FHIR QuestionnaireResponse
   * Maps the answers from the QuestionnaireResponse to the answerDictionary
   */
  private populateAnswersFromQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse): void {
    const currentAnswers = this.answerDictionary();
    if (!questionnaireResponse?.item || !currentAnswers) {
      return;
    }

    // Recursively process items to extract answers
    const processItems = (items: any[]): void => {
      items.forEach(item => {
        if (item.linkId && item.answer?.length > 0) {
          const answer = item.answer[0]; // Take first answer

          // Map different answer types to the answerDictionary
          if (answer.valueString !== undefined) {
            currentAnswers[item.linkId] = answer.valueString;
          } else if (answer.valueInteger !== undefined) {
            currentAnswers[item.linkId] = answer.valueInteger;
          } else if (answer.valueDecimal !== undefined) {
            currentAnswers[item.linkId] = answer.valueDecimal;
          } else if (answer.valueBoolean !== undefined) {
            currentAnswers[item.linkId] = answer.valueBoolean;
          } else if (answer.valueDate !== undefined) {
            currentAnswers[item.linkId] = answer.valueDate;
          } else if (answer.valueTime !== undefined) {
            currentAnswers[item.linkId] = answer.valueTime;
          } else if (answer.valueDateTime !== undefined) {
            currentAnswers[item.linkId] = answer.valueDateTime;
          } else if (answer.valueCoding !== undefined) {
            currentAnswers[item.linkId] = answer.valueCoding.display || answer.valueCoding.code;
          } else if (answer.valueQuantity !== undefined) {
            currentAnswers[item.linkId] = {
              value: answer.valueQuantity.value,
              unit: answer.valueQuantity.unit || answer.valueQuantity.code
            };
          }
        }

        // Process nested items recursively
        if (item.item?.length > 0) {
          processItems(item.item);
        }
      });
    };

    processItems(questionnaireResponse.item);

    // Update the signal (new reference) to trigger UI refresh
    this.answerDictionary.set({...currentAnswers});
  }
}
