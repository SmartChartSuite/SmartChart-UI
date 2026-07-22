import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {DatePipe, TitleCasePipe} from "@angular/common";
import {FormStatus, STATUS_OPTIONS} from "../../models/form-status";
import {PatientGrid} from "../../models/patient-grid";
import {form, FormField, FormRoot} from "@angular/forms/signals";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormStatusDisplayPipe} from "../../pipe/form-status-display.pipe";
import {
  GENDER_OPTIONS,
  PatientSearchData,
  PATIENT_SEARCH_DATA_DEFAULT
} from "../../models/patient-search-data";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {FormSummary} from "../../models/form-summary";


@Component({
  selector: 'app-forms-jobs-grid',
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
export class JobsFormsGridComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected readonly FormStatus = FormStatus;
  protected readonly GENDER_OPTIONS = [...GENDER_OPTIONS];
  protected readonly STATUS_OPTIONS = [...STATUS_OPTIONS];
  protected readonly displayedColumns: string[] = ['formStatus', 'actions', 'patient', 'patientDob', 'patientGender', 'jobPackage', 'batchJobStatus', 'dateRan'];

  // Server-side pagination and data
  readonly patients = signal<PatientGrid[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly isLoading = signal<boolean>(false);

  rcApiInterface = inject(RcApiInterfaceService);
  filtersVisible = signal<boolean>(false);
  formOptions = signal<FormSummary[]>([]);

  // Initialize signal form
  patientSearchModal = signal<PatientSearchData>({...PATIENT_SEARCH_DATA_DEFAULT});
  form = form(this.patientSearchModal);

  ngOnInit(): void {
    // Load form options
    this.rcApiInterface.getQuestionTypes$.subscribe({
      next: (forms) => {
        this.formOptions.set(forms);
      },
      error: (err) => {
        console.error('Error loading form options:', err);
        this.formOptions.set([]);
      }
    });

    // Initial load
    this.loadPatients();
  }

  protected onSearch(): void {
    // Reset to first page when searching with new filters
    this.currentPage.set(0);
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadPatients();
  }

  private buildFilterParams(): any {
    const formValue = this.form().value();
    const filters: any = {};

    const hasValue = (value: any) =>
      typeof value === 'string' ? value.trim().length > 0 : value?.length > 0;

    [
      'patientName',
      'patientGender',
      'questionnaireResponseStatus',
      'jobPackage',
      'batchJobStatus',
    ].forEach((key) => {
      const value = formValue[key];
      if (hasValue(value)) {
        filters[key] = value;
      }
    });

    [
      { source: 'dobRange', startKey: 'dobStartDate', endKey: 'dobEndDate' },
      { source: 'jobRanDateRange', startKey: 'jobRunStartDate', endKey: 'jobRunEndDate' },
    ].forEach(({ source, startKey, endKey }) => {
      const range = formValue[source];
      if (range?.start) filters[startKey] = range.start.toISOString().split('T')[0];
      if (range?.end) filters[endKey] = range.end.toISOString().split('T')[0];
    });

    return filters;
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    this.patients.set([]); // Clear data to show loading indicator
    const filters = this.buildFilterParams();

    this.rcApiInterface.getFormJobsPatientData(
      this.currentPage(),
      this.pageSize(),
      filters
    ).subscribe({
      next: (response) => {
        this.patients.set(response.patients);
        this.totalRecords.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.isLoading.set(false);
        this.patients.set([]);
        this.totalRecords.set(0);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPatients();
  }

  protected onClearFilters() {
    this.form().reset({...PATIENT_SEARCH_DATA_DEFAULT});
    this.currentPage.set(0);
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadPatients();
  }

  protected staleJobFound(patient: PatientGrid): boolean {
    // Show warning if job is not complete and job start date is over 30 days old
    if (patient.questionnaireResponseStatus === FormStatus.COMPLETE) {
      return false;
    }

    if (!patient.jobStartDateTime) {
      return false;
    }

    const jobDate = new Date(patient.jobStartDateTime);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return jobDate < thirtyDaysAgo;
  }
}
