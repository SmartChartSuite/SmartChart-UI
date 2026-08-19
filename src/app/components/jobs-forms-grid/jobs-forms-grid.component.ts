import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import {catchError, firstValueFrom, of, tap} from 'rxjs';

import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { RcApiInterfaceService } from '../../services/rc-api-interface/rc-api-interface.service';
import { FormManagerService } from '../../services/form-manager/form-manager.service';
import { FormStatus, STATUS_OPTIONS } from '../../models/form-status';
import { PatientGrid } from '../../models/patient-grid';
import { FormStatusDisplayPipe } from '../../pipe/form-status-display.pipe';
import { GENDER_OPTIONS, PatientSearchData, PATIENT_SEARCH_DATA_DEFAULT } from '../../models/patient-search-data';
import { ActiveFormSummary } from '../../models/active-form-summary';
import { PatientData } from '../../services/helper/jobs-forms-helper.service';
import {FormSummary} from "../../models/form-summary";
import {openStartNewJobModal} from "../start-new-job-modal/start-new-job-modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-forms-jobs-grid',
  standalone: true,
  imports: [
    DatePipe,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltip,
    MatIcon,
    MatTableModule,
    MatPaginatorModule,
    MatSuffix,
    TitleCasePipe
  ],
  templateUrl: './jobs-forms-grid.component.html',
  styleUrl: './jobs-forms-grid.component.scss',
})
export class JobsFormsGridComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly rcApiInterface = inject(RcApiInterfaceService);
  private readonly formManagerService = inject(FormManagerService);
  private readonly router = inject(Router);

  private dialog: MatDialog = inject(MatDialog);

  protected readonly FormStatus = FormStatus;
  protected readonly GENDER_OPTIONS = [...GENDER_OPTIONS];
  protected readonly STATUS_OPTIONS = [...STATUS_OPTIONS];
  protected readonly displayedColumns: string[] = [
    'formStatus', 'actions', 'patient', 'patientDob',
    'patientGender', 'jobPackage', 'batchJobStatus', 'dateRan', 'timeRan'
  ];

  // Show/hide the filters form
  protected readonly filtersVisible = signal(false);

  // Value used for a data-driven multiselect
  protected readonly formNames = toSignal(
    this.rcApiInterface.getQuestionTypes$.pipe(
      catchError((err) => {
        return of([] as FormSummary[]);
      })
    ),
    { initialValue: [] as FormSummary[] }
  );

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
      this.rcApiInterface.getFormJobsPatientData(params.page, params.size, params.filters).pipe(
        catchError((err) => {
          console.error('Error loading patients:', err);
          return of({ patients: [], total: 0 });
        })
      )
  });

  // Computed Derived State
  protected readonly patients = computed(() => this.patientResource.value()?.patients ?? []);
  protected readonly totalRecords = computed(() => this.patientResource.value()?.total ?? 0);

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
    const patient = await firstValueFrom(this.rcApiInterface.getPatient(row.patientId));
    const qr = await firstValueFrom(this.rcApiInterface.getQuestionnaireResponse(row.questionnaireResponseId));
    this.formManagerService.setSelectedQuestionnaireResponse(qr);
    const activeFormSummary = new ActiveFormSummary(patient, row);
    this.formManagerService.setSelectedActiveFormSummary(activeFormSummary);
    await this.router.navigate(['/form-viewer']);
  }

  protected staleJobFound(patient: PatientGrid): boolean {
    if (patient.questionnaireResponseStatus === FormStatus.COMPLETE || !patient.jobStartDateTime) {
      return false;
    }

    const jobDate = new Date(patient.jobStartDateTime);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return jobDate < thirtyDaysAgo;
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
    openStartNewJobModal(this.dialog).subscribe(value => {if(value?.refreshRequired) {
      //TODO need to know what to trigger here
      this.onClearFilters();
    }});

  }
}
