import {ActiveFormSummary} from "../../models/active-form-summary";
import {
  Component,
  ElementRef,
  OnInit,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  inject,
  DestroyRef
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {ActivatedRoute} from "@angular/router";
import {filter, forkJoin, map, mergeMap, ReplaySubject, share, switchMap, tap} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
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
import {QuestionnaireResponse} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {Item, Questionnaire} from "../../models/fhir/resources/fhir.questionnaire";
import {HasUnsavedChanges} from "../../guards/unsaved-changes.guard";
import {PatientGrid} from "../../models/patient-grid";

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
export class FormViewerComponent implements OnInit, HasUnsavedChanges {
  private readonly rcApiInterfaceService = inject(RcApiInterfaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly utilsService = inject(UtilsService);
  readonly evidenceViewerService = inject(EvidenceViewerService);
  private readonly outputMapper = inject(FormOutputMappingService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly QuestionnaireItemType = QuestionnaireItemType;

  answerDictionary = signal<FormAnswers | undefined>(undefined);
  questionnaire = signal<Questionnaire | undefined>(undefined);
  questionnaireResponseId = '';

  /**
   * QuestionnaireResponse loaded from the route params, applied to the form
   * once the questionnaire definition has been fetched and initialized.
   */
  private pendingQuestionnaireResponse: QuestionnaireResponse | undefined;

  /**
   * Serialized snapshot of the answers as they were last loaded or saved. Used
   * to detect unsaved changes when the user attempts to leave the form.
   */
  private savedAnswersSnapshot = '';

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

    // Load the form entirely from the route params. This makes /form-viewer
    // deep-linkable and removes any dependency on in-memory / session state.
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map(params => ({
        batchId: params.get('batchId'),
        patientId: params.get('patientId'),
        formName: params.get('formName'),
        questionnaireResponseId: params.get('questionnaireResponseId')
      })),
      filter(params => !!params.batchId && !!params.patientId && !!params.formName && !!params.questionnaireResponseId),
      switchMap(params =>
        forkJoin({
          patient: this.rcApiInterfaceService.getPatient(params.patientId!),
          questionnaireResponse: this.rcApiInterfaceService.getQuestionnaireResponse(params.questionnaireResponseId!)
        }).pipe(
          map(({patient, questionnaireResponse}) => ({params, patient, questionnaireResponse}))
        )
      ),
      tap(({params, patient, questionnaireResponse}) => {
        // Rebuild the ActiveFormSummary from the fetched patient + route params.
        this.activeFormSummary.set(new ActiveFormSummary(patient, {
          batchId: params.batchId!,
          jobPackage: params.formName!,
          questionnaireResponseId: params.questionnaireResponseId!
        } as PatientGrid));
        this.pendingQuestionnaireResponse = questionnaireResponse;
        this.questionnaireResponseId = questionnaireResponse.id;
      }),
      mergeMap(({params}) => this.rcApiInterfaceService.getJobPackage({
        key: 'name',
        value: params.formName!
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
        this.captureAnswersSnapshot();
        // Apply the saved answers from the loaded QuestionnaireResponse.
        if (this.pendingQuestionnaireResponse) {
          this.populateAnswersFromQuestionnaireResponse(this.pendingQuestionnaireResponse);
        }
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
        this.captureAnswersSnapshot();
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

    // The loaded QuestionnaireResponse represents the persisted state, so treat
    // it as the clean baseline for unsaved-changes detection.
    this.captureAnswersSnapshot();
  }

  /**
   * Records the current answers as the clean baseline. Called after the form is
   * loaded, populated from a saved response, or successfully saved.
   */
  private captureAnswersSnapshot(): void {
    this.savedAnswersSnapshot = this.serializeAnswers();
  }

  private serializeAnswers(): string {
    return JSON.stringify(this.answerDictionary() ?? {});
  }

  /** True when the current answers differ from the last saved/loaded snapshot. */
  hasUnsavedChanges(): boolean {
    return this.serializeAnswers() !== this.savedAnswersSnapshot;
  }
}
