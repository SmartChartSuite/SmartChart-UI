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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {ActivatedRoute} from "@angular/router";
import {filter, forkJoin, interval, map, mergeMap, ReplaySubject, share, switchMap, tap} from "rxjs";
import {Results, ResultSet} from "../../models/results";
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
import {MatTooltip} from "@angular/material/tooltip";
import {MatChip} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {EvidenceDetailsComponent} from "./evidence-details/evidence-details.component";
import {SuggestedAnswerFormatterPipe} from "../../pipe/suggested-answer-formatter.pipe";
import {QuestionnaireResponse} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {QuestionnaireResponseStatus} from "../../models/fhir/valuesets/questionnaire-response-status";
import {AnswerOption, Item, Questionnaire} from "../../models/fhir/resources/fhir.questionnaire";
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
    MatTooltip,
    MatChip,
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
  questionnaireResponseStatus = signal<QuestionnaireResponseStatus | undefined>(undefined);
  initialLoadComplete = signal(false);
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
  /**
   * Collapsed state of the left-hand section navigation. When collapsed the
   * sub-nav shrinks to a narrow strip (only the expand toggle is shown),
   * giving the questions and evidence sections more room.
   */
  menuCollapsed = signal(false);
  activeFormSummary = signal<ActiveFormSummary | undefined>(undefined);
  selectedMenuItemIndex = 0;
  selectedEvidenceIndex: number | null = null;
  selectedEvidenceQuestion = signal<string | undefined>(undefined);
  evidenceReviewActive = false;
  lastSavedAt = signal<Date | undefined>(undefined);
  lastSavedLabel = signal('');

  results = signal<Results | undefined>(undefined);

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
    interval(1_000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.updateLastSavedLabel());

    // Results Handling
    const results$ = this.refreshTrigger$.pipe(
      switchMap(() => this.fetchResults()),
      share()
    );

    results$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.results.set(value);
      this.initialLoadComplete.set(true);
      // On first load, auto-select the first question in the initially-selected
      // section (mirrors clicking a section).
      if (this.selectedEvidenceIndex === null) {
        this.selectFirstQuestion(this.selectedMenuItemIndex);
      }
    }, () => {
      this.initialLoadComplete.set(true);
      this.utilsService.showErrorMessage();
    });

    this.loadFormFromRoute();
  }

  /**
   * Loads the form from the route so /form-viewer remains deep-linkable and
   * does not depend on in-memory or session state.
   */
  private loadFormFromRoute(): void {
    // Read all identifiers needed to load the patient, response, and form.
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map(params => ({
        batchId: params.get('batchId'),
        patientId: params.get('patientId'),
        formName: params.get('formName'),
        questionnaireResponseId: params.get('questionnaireResponseId')
      })),
      filter(params => !!params.batchId && !!params.patientId && !!params.formName && !!params.questionnaireResponseId),
      // Load the patient and saved answers together before loading the form.
      switchMap(params =>
        forkJoin({
          patient: this.rcApiInterfaceService.getPatient(params.patientId!),
          questionnaireResponse: this.rcApiInterfaceService.getQuestionnaireResponse(params.questionnaireResponseId!)
        }).pipe(
          map(({patient, questionnaireResponse}) => ({params, patient, questionnaireResponse}))
        )
      ),
      tap(({params, patient, questionnaireResponse}) => {
        // Store the route-backed form context for the viewer and API calls.
        this.activeFormSummary.set(new ActiveFormSummary(patient, {
          batchId: params.batchId!,
          jobPackage: params.formName!,
          questionnaireResponseId: params.questionnaireResponseId!
        } as PatientGrid));
        this.pendingQuestionnaireResponse = questionnaireResponse;
        this.questionnaireResponseId = questionnaireResponse.id;
        this.questionnaireResponseStatus.set(questionnaireResponse.status);
      }),
      // Fetch the questionnaire definition after the route context is ready.
      mergeMap(({params}) => this.rcApiInterfaceService.getJobPackage({
        key: 'name',
        value: params.formName!
      })),
      map(response => Array.isArray(response) ? (response[0] ?? null) : response),
      // Mark the first section as selected before rendering the questionnaire.
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
        // Apply persisted answers after the questionnaire structure is ready.
        if (this.pendingQuestionnaireResponse) {
          this.populateAnswersFromQuestionnaireResponse(this.pendingQuestionnaireResponse);
        }
        this.refreshTrigger$.next(1);
      },
      error: err => {
        console.error(err);
        this.initialLoadComplete.set(true);
        this.utilsService.showErrorMessage();
      }
    });
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
    this.selectFirstQuestion(index);
  }

  /**
   * Selects the first question in the section and renders its evidence. If the
   * first question has no evidence, the evidence viewer renders its empty state
   * ("No ... Evidence Found").
   */
  private selectFirstQuestion(sectionIndex: number): void {
    const section = this.questionnaire()?.item?.[sectionIndex];
    const results = this.results();
    if (!section?.item?.length || !results) {
      return;
    }

    const firstQuestionIndex = section.item.findIndex(
      item => item.type !== QuestionnaireItemType.display
    );
    if (firstQuestionIndex === -1) {
      return;
    }

    this.selectedEvidenceIndex = firstQuestionIndex;
    const firstQuestion = section.item[firstQuestionIndex];
    this.selectedEvidenceQuestion.set(firstQuestion.text);
    const resultSet = results[`link${firstQuestion.linkId}`];
    this.evidenceViewerService.setEvidence(resultSet ?? new ResultSet());
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
    this.selectedEvidenceIndex = index;
    this.selectedEvidenceQuestion.set(
      this.questionnaire()?.item?.[this.selectedMenuItemIndex]?.item?.[index]?.text
    );
  }

  protected onQuestionHeaderSelected(index: number): void {
    const question = this.questionnaire()?.item?.[this.selectedMenuItemIndex]?.item?.[index];
    const resultSet = question ? this.results()?.['link' + question.linkId] : undefined;
    if (!question || question.type === QuestionnaireItemType.display) {
      return;
    }

    this.toggleEvidenceDrawer(index);
    this.evidenceViewerService.setEvidence(resultSet ?? new ResultSet());
  }

  protected onEvidenceReviewKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isQuestionHeader = !!target?.closest('.question-header');
    const isEditable = target?.matches('input, textarea, select, [contenteditable="true"]');
    if (!this.evidenceReviewActive || isEditable || (!isQuestionHeader && event.target !== event.currentTarget)) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.moveToAdjacentQuestion(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  private moveToAdjacentQuestion(direction: 1 | -1): void {
    const section = this.questionnaire()?.item?.[this.selectedMenuItemIndex];
    if (!section?.item?.length) return;

    const questionIndexes = section.item
      .map((question, index) => question.type === QuestionnaireItemType.display ? -1 : index)
      .filter(index => index >= 0);
    const currentPosition = questionIndexes.indexOf(this.selectedEvidenceIndex ?? -1);
    const nextPosition = currentPosition + direction;
    const nextIndex = questionIndexes[nextPosition];
    if (nextIndex === undefined) return;

    this.onQuestionHeaderSelected(nextIndex);

    queueMicrotask(() => {
      const headers = this.topScroll()?.nativeElement.querySelectorAll<HTMLElement>('.question-header');
      const nextHeader = headers?.[questionIndexes.indexOf(nextIndex)];
      nextHeader?.focus();
      nextHeader?.scrollIntoView({block: 'nearest'});
    });
  }

  /** Toggles the left-hand section navigation between expanded and collapsed. */
  toggleMenu(): void {
    this.menuCollapsed.update(collapsed => !collapsed);
  }

  onExport(): void {
    openExportFileDialog(this.dialog, {})
      .subscribe(exportType => {
        if (exportType === 'json') {
          const questionnaireResponse = this.outputMapper.mapQrToFhir(
            this.answerDictionary(), this.questionnaire(), this.activeFormSummary());
          const questionnaire = this.questionnaire();
          const exportBundle = {
            resourceType: 'Bundle',
            type: 'collection',
            entry: [
              ...(questionnaire ? [{resource: questionnaire}] : []),
              {resource: questionnaireResponse}
            ]
          };
          const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {type: 'application/fhir+json'});
          const link = document.createElement('a');

          link.href = URL.createObjectURL(blob);
          link.download = `SmartChart_Form_Export.json`;
          document.body.appendChild(link);
          link.click();
          document.body?.removeChild(link);
          URL.revokeObjectURL(link.href);
        } else if (exportType === 'pdf') {
          //TODO implement the pdf export
        }
      });
  }

  /**
   * The scalar value the radio group binds to for a given option, supporting
   * both `valueCoding` (uses the code) and `valueString` (uses the string).
   */
  protected getOptionValue(option: AnswerOption): string | undefined {
    return option.valueCoding ? option.valueCoding.code : option.valueString;
  }

  protected getQuestionnaireResponseStatusLabel(
    status: QuestionnaireResponseStatus | undefined
  ): string {
    switch (status) {
      case QuestionnaireResponseStatus.inProgress:
        return 'In Progress';
      case QuestionnaireResponseStatus.completed:
        return 'Completed';
      case QuestionnaireResponseStatus.amended:
        return 'Amended';
      case QuestionnaireResponseStatus.enteredInError:
        return 'Entered in Error';
      case QuestionnaireResponseStatus.stopped:
        return 'Stopped';
      default:
        return '';
    }
  }

  /** The human-readable label for an option, for either format. */
  protected getOptionLabel(option: AnswerOption): string | undefined {
    return option.valueCoding ? option.valueCoding.display : option.valueString;
  }

  /**
   * The scalar value currently selected for a choice item, derived from the
   * stored answer. Coding answers are stored as `{code, display}` objects, so
   * the code is returned; string answers are returned as-is.
   */
  protected getSelectedChoiceValue(item: Item): string | undefined {
    const answer = this.answerDictionary()?.[item.linkId];
    if (answer && typeof answer === 'object') {
      return answer.code;
    }
    return answer;
  }

  /**
   * Stores a choice selection. For `valueCoding` options the full Coding
   * (code + display) is stored so the QuestionnaireResponse can emit a complete
   * valueCoding; for `valueString` options the plain string is stored. The
   * radio group binds to the scalar value; here we resolve it back to the
   * matching answerOption.
   */
  protected onChoiceSelected(item: Item, value: string): void {
    const selected = item.answerOption?.find(
      option => this.getOptionValue(option) === value
    );
    this.answerDictionary.update(current => ({
      ...current,
      [item.linkId]: selected?.valueCoding
        ? {code: selected.valueCoding.code, display: selected.valueCoding.display}
        : (selected?.valueString ?? '')
    }) as FormAnswers);
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

  protected getQuestionNumber(section: Item, questionIndex: number): number {
    return (section.item ?? [])
      .slice(0, questionIndex)
      .filter(question => question.type !== QuestionnaireItemType.display)
      .length + 1;
  }

  protected getAnsweredQuestionCount(item: Item): number {
    return (item.item ?? []).filter(question => {
      if (question.type === QuestionnaireItemType.display) {
        return false;
      }

      const answer = this.answerDictionary()?.[question.linkId];
      if (answer === undefined || answer === null || answer === '') {
        return false;
      }

      return !Array.isArray(answer) || answer.length > 0;
    }).length;
  }

  protected getTotalQuestionCount(): number {
    return (this.questionnaire()?.item ?? []).reduce(
      (total, section) => total + this.getQuestionCount(section), 0
    );
  }

  protected getTotalAnsweredQuestionCount(): number {
    return (this.questionnaire()?.item ?? []).reduce(
      (total, section) => total + this.getAnsweredQuestionCount(section), 0
    );
  }

  protected getOverallProgressPercent(): number {
    const totalQuestions = this.getTotalQuestionCount();
    return totalQuestions > 0
      ? (this.getTotalAnsweredQuestionCount() / totalQuestions) * 100
      : 0;
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
        this.lastSavedAt.set(new Date());
        this.updateLastSavedLabel();
        this.utilsService.showSuccessMessage("Form Saved Successfully");
      },
      error: (error) => {
        console.error(error);
        this.utilsService.showErrorMessage("Error Saving Form");
      }
    });
  }

  protected updateLastSavedLabel(): void {
    const savedAt = this.lastSavedAt();
    if (!savedAt) return;

    const elapsedMinutes = Math.floor((Date.now() - savedAt.getTime()) / 60_000);
    if (elapsedMinutes < 1) {
      this.lastSavedLabel.set('Last saved just now');
    } else if (elapsedMinutes < 60) {
      this.lastSavedLabel.set(`Last saved ${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'} ago`);
    } else {
      const elapsedHours = Math.floor(elapsedMinutes / 60);
      this.lastSavedLabel.set(`Last saved about ${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`);
    }
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
            // Choice answers are stored as the full Coding object so the radio
            // group can round-trip them (matched via compareCoding by code).
            currentAnswers[item.linkId] = {
              code: answer.valueCoding.code,
              display: answer.valueCoding.display
            };
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
