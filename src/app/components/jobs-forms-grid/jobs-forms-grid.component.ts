import { Component, computed, DestroyRef, inject, linkedSignal, signal, ViewChild } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { catchError, forkJoin, map, of } from 'rxjs';

import {MatButton, MatIconButton} from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RcApiInterfaceService } from '../../services/rc-api-interface/rc-api-interface.service';
import { FormStatus, FORM_STATUS_OPTIONS } from '../../models/form-status';
import { FormStatus as JobStatus, JOB_STATUS_OPTIONS, PatientGrid } from '../../models/patient-grid';
import { FormStatusDisplayPipe } from '../../pipe/form-status-display.pipe';
import { GENDER_OPTIONS, PatientSearchData, PATIENT_SEARCH_DATA_DEFAULT } from '../../models/patient-search-data';
import { PatientData } from '../../services/helper/jobs-forms-helper.service';
import { Questionnaire } from '../../models/fhir/resources/fhir.questionnaire';
import { QuestionnaireResponse } from '../../models/fhir/resources/fhir.questionnaireresponse';
import { FormDetails } from '../../models/form-details';
import { FormDetailsHelperService } from '../../services/helper/form-details-helper.service';
import { UtilsService } from '../../services/utils/utils.service';
import {FormSummary} from '../../models/form-summary';
import {openStartNewJobModal} from "../start-new-job-modal/start-new-job-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {openConfirmationDialog} from "../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-forms-jobs-grid',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    FormRoot,
    FormField,
    FormStatusDisplayPipe,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltip,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTableModule,
    MatPaginatorModule,
    MatSuffix,
    TitleCasePipe,
    MatIconButton
  ],
  templateUrl: './jobs-forms-grid.component.html',
  styleUrl: './jobs-forms-grid.component.scss',
})
export class JobsFormsGridComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly rcApiInterface = inject(RcApiInterfaceService);
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formDetailsHelper = inject(FormDetailsHelperService);

  private dialog: MatDialog = inject(MatDialog);

  protected readonly FormStatus = FormStatus;
  protected readonly JobStatus = JobStatus;
  protected readonly GENDER_OPTIONS = [...GENDER_OPTIONS];
  protected readonly FORM_STATUS_OPTIONS = [...FORM_STATUS_OPTIONS];
  protected readonly JOB_STATUS_OPTIONS = [...JOB_STATUS_OPTIONS];
  protected readonly displayedColumns: string[] = [
    'formStatus', 'actions', 'patient', 'patientDob',
    'patientGender', 'jobPackage', 'batchJobStatus', 'dateRan',  'warning'
  ];
  protected readonly progressColumns = ['progress'];

  // Show/hide the filters form
  protected readonly filtersVisible = signal(false);

  // Value used for a data-driven multiselect
  protected readonly formNames = toSignal(
    this.rcApiInterface.getFormNames$.pipe(
      catchError(() => {
        return of([] as FormSummary[]);
      })
    ),
    { initialValue: [] as FormSummary[] }
  );

  protected readonly formNameSearch = signal('');
  protected readonly filteredFormNames = computed(() => {
    const search = this.formNameSearch().trim().toLowerCase();

    if (!search) {
      return this.formNames();
    }

    return this.formNames().filter(formName =>
      formName.name.toLowerCase().includes(search) ||
      formName.title.toLowerCase().includes(search)
    );
  });

  protected onFormNameInput(event: Event): void {
    this.formNameSearch.set((event.target as HTMLInputElement).value);
  }

  protected displayFormName = (formName: string | null): string => {
    if (!formName) {
      return '';
    }

    return this.formNames().find(item => item.name === formName)?.title ?? formName;
  };

  // Pagination & Search Signals
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly activeSearchFilters = signal<Record<string, any>>({});

  // Signal Form Setup
  protected readonly patientSearchModal = signal<PatientSearchData>({ ...PATIENT_SEARCH_DATA_DEFAULT });
  protected readonly form = form(this.patientSearchModal, {
    submission: {
      action: async () => this.onSearch()
    }
  });

  // Reactive Data Resource (Replaces loadPatients() & subscribe)
  protected readonly patientResource = rxResource<
    PatientData,
    { page: number; size: number; filters: Record<string, any> }
  >({
    params: () => ({
      page: this.currentPage(),
      size: this.pageSize(),
      filters: this.activeSearchFilters()
    }),
    stream: ({ params }) =>
      this.rcApiInterface.getFormJobsPatientDataStream(params.page, params.size, params.filters).pipe(
        catchError((err) => {
          console.error('Error loading patients:', err);
          return of({ patients: [], total: 0 });
        })
      )
  });

  // Computed Derived State
  protected readonly patients = computed(() => this.patientResource.value()?.patients ?? []);
  protected readonly totalRecords = computed(() => this.patientResource.value()?.total ?? 0);
  protected readonly selectedBatchId = signal<string | undefined>(undefined);
  protected readonly selectedForm = computed(() =>
    this.patients().find(patient => patient.batchId === this.selectedBatchId())
  );
  protected readonly formDetailsExpanded = signal(false);

  // Each stream snapshot replaces every row object, so compare by value: details
  // only refetch when the selection or the saved response actually changes.
  private readonly selectedFormDetailsParams = computed(() => {
    const form = this.selectedForm();
    return {
      batchId: form?.batchId,
      questionnaireId: form?.questionnaireId,
      formName: form?.jobPackage,
      questionnaireResponseId: form?.questionnaireResponseId,
      patientId: form?.patientId,
      responseLastUpdated: form?.responseLastUpdated,
      responseStatus: form?.questionnaireResponseStatus
    };
  }, {
    equal: (a, b) => (Object.keys(a) as (keyof typeof a)[]).every(key => a[key] === b[key])
  });

  protected readonly selectedFormDetails = rxResource<
    FormDetails | undefined,
    { batchId?: string; questionnaireId?: string; formName?: string; questionnaireResponseId?: string; patientId?: string }
  >({
    params: () => this.selectedFormDetailsParams(),
    stream: ({ params }) => {
      if (!params.batchId || (!params.questionnaireId && !params.formName) || !params.questionnaireResponseId) {
        return of(undefined);
      }

      return forkJoin({
        questionnaire: params.questionnaireId
          ? this.rcApiInterface.getQuestionnaire(params.questionnaireId)
          : this.rcApiInterface.getJobPackage({key: 'name', value: params.formName!}).pipe(
              map(response => Array.isArray(response) ? (response[0] ?? undefined) : response)
            ),
        questionnaireResponse: this.rcApiInterface.getQuestionnaireResponse(params.questionnaireResponseId),
        // Patient and identifier config are supplementary; a failure should not hide the form details.
        patient: params.patientId
          ? this.rcApiInterface.getPatient(params.patientId).pipe(catchError(() => of(undefined)))
          : of(undefined),
        config: this.rcApiInterface.getConfig().pipe(catchError(() => of(undefined)))
      }).pipe(map(({questionnaire, questionnaireResponse, patient, config}) =>
        this.formDetailsHelper.toFormDetails(params.batchId!, questionnaire as Questionnaire, questionnaireResponse, patient, config)
      ));
    }
  });

  // Holds the most recently loaded details, so a refresh of the same form
  // updates the pane in place instead of blanking it to a loading message.
  private readonly lastFormDetails = linkedSignal<FormDetails | undefined, FormDetails | undefined>({
    source: () => this.selectedFormDetails.hasValue() ? this.selectedFormDetails.value() : undefined,
    computation: (details, previous) => details ?? previous?.value
  });

  // Only show held details that belong to the currently selected row.
  protected readonly displayedFormDetails = computed(() => {
    const details = this.lastFormDetails();
    return details?.batchId === this.selectedBatchId() ? details : undefined;
  });

  protected onSearch(): void {
    this.currentPage.set(0);
    this.paginator?.firstPage();
    this.activeSearchFilters.set(this.buildFilterParams());
  }

  protected onClearFilters(): void {
    this.form().reset({ ...PATIENT_SEARCH_DATA_DEFAULT });
    this.currentPage.set(0);
    this.paginator?.firstPage();
    this.activeSearchFilters.set({});
  }

  protected onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected async onSelectRecord(row: PatientGrid): Promise<void> {
    this.selectForm(row);
    // Pass everything the form-viewer needs to load itself directly via the
    // route params.
    await this.router.navigate([
      '/form-viewer',
      row.batchId,
      row.patientId,
      row.jobPackage,
      row.questionnaireResponseId
    ]);
  }

  protected selectForm(row: PatientGrid): void {
    this.selectedBatchId.set(row.batchId);
    this.formDetailsExpanded.set(false);
  }

  protected toggleFormDetails(): void {
    this.formDetailsExpanded.update(expanded => !expanded);
  }

  protected staleJobFound(patient: PatientGrid): boolean {
    if (patient.batchJobStatus === JobStatus.COMPLETE || !patient.jobStartDateTime) {
      return false;
    }

    const jobDate = new Date(patient.jobStartDateTime);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return jobDate < thirtyDaysAgo;
  }

  protected isMainRow(): boolean {
    return true;
  }

  protected isProgressRow(): boolean {
    return true;
  }

  protected isActiveJob(patient: PatientGrid): boolean {
    return patient.batchJobStatus === JobStatus.PENDING
      || patient.batchJobStatus === JobStatus.RUNNING;
  }

  protected jobStatusLabel(patient: PatientGrid): string {
    return this.JOB_STATUS_OPTIONS.find(option => option.value === patient.batchJobStatus)?.display
      ?? patient.batchJobStatus;
  }

  protected jobProgressPercent(patient: PatientGrid): number {
    return Math.max(0, Math.min(100, patient.batchJobProgress ?? 0));
  }

  private buildFilterParams(): Record<string, any> {
    const formValue = this.form().value();
    const filters: Record<string, any> = {};

    const hasValue = (value: any) =>
      typeof value === 'string' ? value.trim().length > 0 : value?.length > 0;

    [
      'patientName',
      'patientGender',
      'questionnaireResponseStatus',
      'jobPackage',
      'batchJobStatus',
    ].forEach((key) => {
      const value = formValue[key as keyof PatientSearchData];
      if (hasValue(value)) {
        filters[key] = value;
      }
    });

    [
      { source: 'dobRange', startKey: 'dobStartDate', endKey: 'dobEndDate' },
      { source: 'jobRanDateRange', startKey: 'jobRunStartDate', endKey: 'jobRunEndDate' },
    ].forEach(({ source, startKey, endKey }) => {
      const range = formValue[source as keyof PatientSearchData] as any;
      if (range?.start) filters[startKey] = range.start.toISOString().split('T')[0];
      if (range?.end) filters[endKey] = range.end.toISOString().split('T')[0];
    });

    return filters;
  }

  protected onStartNewJob() {
    openStartNewJobModal(this.dialog).subscribe();

  }

  private deleteJob(batchId: string): void {
    this.rcApiInterface.deleteBatchJob(batchId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.utilsService.showSuccessMessage('Job/Form deleted successfully');
        // Reload the grid so the deleted row is removed.
      },
      error: (err) => {
        console.error('Error deleting job:', err);
      }
    });
  }

  protected onDeleteJob(patient: PatientGrid) {
    return openConfirmationDialog(this.dialog, {
      title: "Delete Job/Form",
      content: `You are about to permanently delete the <i>${patient.jobPackage}</i> form for <i>${patient.patientName}</i>, along with all associated jobs. This action cannot be undone. Do you want to continue?`,
      primaryActionBtnTitle: "Yes, delete this form",
      secondaryActionBtnTitle: "No, return to form list",
      width: "40em",
      isPrimaryButtonLeft: false,
      isSecondaryActionDanger: true
    }).subscribe(value => {
      if(value == 'primaryAction') {
        this.deleteJob(patient.batchId)
      }
    })
  };
}
