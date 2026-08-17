import {ActiveFormSummary} from "../../models/active-form-summary";
import {Component, ElementRef, OnDestroy, OnInit, signal, computed, ViewChild, ChangeDetectionStrategy, inject} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {Router} from "@angular/router";
import {RouteState} from "../../models/application-state";
import {StateManagementService} from "../../services/state-management/state-management.service";
import {map, Observable, ReplaySubject, switchMap, tap} from "rxjs";
import {Results} from "../../models/results";
import {UtilsService} from "../../services/utils/utils.service";
import {EvidenceViewerService} from "../../services/evidence-viewer/evidence-viewer.service";
import { TIMEZONES } from '../../../assets/const/timezones';
import {FormOutputMappingService} from "../../services/form-output-mapping/form-output-mapping.service";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import {FormHelperService} from "../../services/form-helper/form-helper.service";
import {openExportFileDialog} from "../export-selection-dialog/export-selection-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { PatientDetailsComponent } from "./patient-details/patient-details.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";
import { MatNavList } from "@angular/material/list";
import {NgClass, AsyncPipe} from "@angular/common";
import { QuestionnaireIndexDirective } from "../../directives/questionnaire-index.directive";
import { MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import { MatFormField, MatLabel, MatHint } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatTooltip } from "@angular/material/tooltip";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatTimepickerInput, MatTimepickerModule } from "@angular/material/timepicker";
import { SetEvidenceDirective } from "../../directives/set-evidence.directive";
import { MatIcon } from "@angular/material/icon";
import { EvidenceDetailsComponent } from "./evidence-details/evidence-details.component";
import {Item, Questionnaire} from "../../models/questionnaire";

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
    ReactiveFormsModule,
    MatRadioButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatHint,
    MatTooltip,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatTimepickerInput,
    MatTimepickerModule,
    SetEvidenceDirective,
    MatIcon,
    EvidenceDetailsComponent,
    AsyncPipe,
  ]
})
export class FormViewerComponent implements OnInit, OnDestroy {
  // Services using inject()
  private readonly rcApiInterfaceService = inject(RcApiInterfaceService);
  private readonly formManagerService = inject(FormManagerService);
  private readonly router = inject(Router);
  private readonly stateManagementService = inject(StateManagementService);
  private readonly utilsService = inject(UtilsService);
  private readonly outputMapper = inject(FormOutputMappingService);
  private readonly dialog = inject(MatDialog);
  private readonly formHelperService = inject(FormHelperService);

  protected readonly evidenceViewerService = inject(EvidenceViewerService);
  protected readonly QuestionnaireItemType = QuestionnaireItemType;
  protected readonly TIMEZONES = TIMEZONES;

  // Core state signals
  protected formGroup!: FormGroup;
  protected readonly questionnaire = signal<Questionnaire | undefined>(undefined);
  protected readonly activeFormSummary = signal<ActiveFormSummary | undefined>(undefined);
  protected readonly results = signal<Results | undefined>(undefined);

  // UI state signals
  protected readonly showDrawer = signal(false);
  protected readonly selectedMenuItemIndex = signal(0);
  protected readonly selectedEvidenceIndex = signal<number | null>(null);

  // Computed signals for derived state
  protected readonly jobStatus = computed(() => {
    const r = this.results();
    return {
      status: r?.status ?? 'fetching',
      completeCount: r?.completeJobs ?? 0,
      totalCount: r?.totalJobs ?? 0,
      percentComplete: ((r?.completeJobs ?? 0) / (r?.totalJobs || 1)) * 100
    };
  });

  protected readonly currentSection = computed(() => {
    const q = this.questionnaire();
    const index = this.selectedMenuItemIndex();
    return q?.item?.[index];
  });

  // Observables
  protected evidenceViewerExpanded$: Observable<boolean>;

  @ViewChild('top') topScroll!: ElementRef;

  // Refresh trigger
  private readonly refreshTrigger$ = new ReplaySubject<number>(1);

  ngOnDestroy(): void {
    // Save the current form state to session storage
    const activeForm = this.activeFormSummary();
    if (activeForm?.batchId && this.formGroup) {
      this.stateManagementService.saveFormState(activeForm.batchId, this.formGroup.value);
    }
  }

  ngOnInit(): void {
    this.setupResultsPolling();
    this.setupFormLoader();
    this.setupEvidenceViewer();
  }

  private setupResultsPolling(): void {
    this.refreshTrigger$
      .pipe(switchMap(() => this.fetchResults()))
      .subscribe(results => this.results.set(results));
  }

  private setupFormLoader(): void {
    this.formManagerService.selectedActiveFormSummary$
      .pipe(
        tap(summary => this.activeFormSummary.set(summary)),
        switchMap(summary => {
          if (!summary) return [];
          return this.loadQuestionnaire(summary.formName);
        })
      )
      .subscribe({
        next: questionnaire => this.initializeQuestionnaire(questionnaire),
        error: () => this.utilsService.showErrorMessage()
      });
  }

  private setupEvidenceViewer(): void {
    this.evidenceViewerExpanded$ = this.evidenceViewerService.viewerExpanded$;
    this.stateManagementService.setCurrentRoute(RouteState.CURRENT_FORM);
    this.evidenceViewerService.setViewerExpanded(window.screen.width >= 1440);
  }

  private loadQuestionnaire(formName: string): Observable<any> {
    return this.rcApiInterfaceService.getJobPackage({ key: 'name', value: formName })
      .pipe(
        map(response => Array.isArray(response) ? response[0] : response)
      );
  }

  private initializeQuestionnaire(data: any): void {
    this.questionnaire.set(new Questionnaire(data));
    this.initializeFormGroup();
    this.selectQuestionnaireSection(0);
    this.refreshTrigger$.next(1);
  }

  private initializeFormGroup(): void {
    // Service creates and manages the entire form
    this.formGroup = this.formHelperService.buildFormGroupFromQuestionnaire(this.questionnaire());

    // Restore saved form state if available
    const activeForm = this.activeFormSummary();
    if (activeForm?.batchId) {
      const savedState = this.stateManagementService.getFormState(activeForm.batchId);
      if (savedState) {
        this.formHelperService.populateFormGroup(this.formGroup, savedState);
      }
    }
  }

  private fetchResults(): Observable<Results> {
    const activeForm = this.activeFormSummary();
    if (!activeForm) {
      throw new Error('No active form summary available');
    }
    return this.rcApiInterfaceService.getBatchJobResults(activeForm.batchId);
  }

  selectQuestionnaireSection(index: number): void {
    this.selectedMenuItemIndex.set(index);

    this.questionnaire.update(current => {
      if (!current?.item) return current;

      current.item.forEach((item, i) => {
        item.selected = i === index;
      });

      return current;
    });
  }

  nextSection(): void {
    const currentIndex = this.selectedMenuItemIndex();
    const itemLength = this.questionnaire()?.item?.length ?? 0;
    if (currentIndex < itemLength - 1) {
      this.selectQuestionnaireSection(currentIndex + 1);
      this.scrollToTop();
    }
  }

  previousSection(): void {
    const currentIndex = this.selectedMenuItemIndex();
    if (currentIndex > 0) {
      this.selectQuestionnaireSection(currentIndex - 1);
      this.scrollToTop();
    }
  }


  onSubmit(): void {
    openExportFileDialog(this.dialog, {})
      .subscribe(exportType => {
        if (exportType === 'json') {
          this.exportAsJson();
        } else if (exportType === 'pdf') {
          // TODO: implement PDF export
        }
      });
  }

  private exportAsJson(): void {
    const questionnaireResponse = this.outputMapper.mapToFhir(
      this.formGroup.value as any,
      this.questionnaire()
    );

    const blob = new Blob([JSON.stringify(questionnaireResponse)], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'FHIR_Question_Response.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // Clear saved form state after successful submission
    const activeForm = this.activeFormSummary();
    if (activeForm?.batchId) {
      this.stateManagementService.clearFormState(activeForm.batchId);
    }
  }

  selectPatientForm(): void {
    this.router.navigate(['/forms']);
  }

  protected getDateTimeFormGroup(linkId: string): FormGroup {
    return this.formGroup.get(`${linkId}_dateTime`) as unknown as FormGroup;
  }

  scrollToTop(): void {
    this.topScroll?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected getQuestionCount(item: Item): number {
    if (!item?.item?.length) return 0;
    return item.item.filter(element => element?.type !== 'display').length;
  }

  protected getEvidenceCount(linkId: string, results: Results | undefined): number | string {
    if (!results || !linkId) return 'ERROR';

    const evidence = results[`link${linkId}`]?.evidence;
    return evidence ? evidence.length : 'ERROR';
  }

  protected getQuestionsWithEvidenceCount(item: Item, results: Results | undefined): number {
    if (!item?.item?.length || !results) return 0;

    return item.item.reduce((count, childItem) => {
      const evidenceCount = this.getEvidenceCount(childItem.linkId, results);
      return count + (typeof evidenceCount === 'number' && evidenceCount > 0 ? 1 : 0);
    }, 0);
  }

}
