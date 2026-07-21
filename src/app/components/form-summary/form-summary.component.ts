import {Component, computed, effect, inject, OnInit, signal, ViewChild} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {DatePipe} from "@angular/common";
import {FormStatus, StatusOption, STATUS_OPTIONS} from "../../models/form-status";
import {PatientGrid} from "../../models/patient-grid";
import {form, FormField, FormRoot} from "@angular/forms/signals";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormStatusDisplayPipe} from "../../pipe/form-status-display.pipe";
import {
  DateRange,
  GENDER_OPTIONS,
  GenderOption,
  PatientSearchData,
  PATIENT_SEARCH_DATA_DEFAULT
} from "../../models/patient-search-data";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {MatTable, MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-form-summary',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    FormRoot,
    FormField,
    FormStatusDisplayPipe,
    MatButton,
    MatIconButton,
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
    MatHint
  ],
  templateUrl: './form-summary.component.html',
  styleUrl: './form-summary.component.scss',
})
export class FormSummaryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected readonly FormStatus = FormStatus;
  protected readonly GENDER_OPTIONS = [...GENDER_OPTIONS];
  protected readonly STATUS_OPTIONS = [...STATUS_OPTIONS];
  protected readonly displayedColumns: string[] = ['formStatus', 'actions', 'patient', 'patientDob', 'patientGender', 'jobStatus', 'dateRan'];

  // Store all patients loaded from API
  private readonly allPatients = signal<PatientGrid[]>([]);

  // Current pagination state
  private readonly currentPage = signal<number>(0);
  private readonly pageSize = signal<number>(10);

  isLoading = signal<boolean>(false);
  rcApiInterface = inject(RcApiInterfaceService);

  filtersVisible = signal<boolean>(false);

  // Initialize signal form modal and assign to the
  patientSearchModal = signal<PatientSearchData>({...PATIENT_SEARCH_DATA_DEFAULT});
  form = form(this.patientSearchModal);

  // Computed signal for filtered patients based on form values
  private readonly filteredPatients = computed(() => {
    const allPts = this.allPatients();
    const formValue = this.form().value();

    let filtered = [...allPts];

    filtered = this.filterByName(filtered, formValue.patientName);
    filtered = this.filterByGender(filtered, formValue.gender);
    filtered = this.filterByDobRange(filtered, formValue.dobRange);
    filtered = this.filterByStatus(filtered, formValue.formStatus);

    return filtered;
  });

  // Total records after filtering
  readonly totalRecords
    = computed(() => this.filteredPatients().length);

  // Paginated patients for display
  readonly patients = computed(() => {
    const filtered = this.filteredPatients();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = page * size;
    const end = start + size;
    return filtered.slice(start, end);
  });

  ngOnInit(): void {
    // Load all patients once on initialization
    this.loadAllPatients();
  }

  // basic filter using filter by name
  private filterByName(patients: PatientGrid[], name: string): PatientGrid[] {
    if (!name || name.length === 0) {
      return patients;
    }
    const nameSearch = name.toLowerCase();
    return patients.filter(patient => {
      const fullName = `${patient.patientName.given || ''} ${patient.patientName.family || ''}`.toLowerCase();
      return fullName.startsWith(nameSearch);
    });
  }

  private filterByGender(patients: PatientGrid[], genders: GenderOption[]): PatientGrid[] {
    if (!genders || !Array.isArray(genders) || genders.length === 0) {
      return patients;
    }
    return patients.filter(patient =>
      genders.some((g: string) => patient.patientGender.toLowerCase() === g.toLowerCase())
    );
  }

  private filterByDobRange(patients: PatientGrid[], dobRange: DateRange): PatientGrid[] {
    let filtered = patients;

    if (dobRange.start) {
      filtered = filtered.filter(patient =>
        new Date(patient.patientDob) >= new Date(dobRange.start!)
      );
    }
    if (dobRange.end) {
      filtered = filtered.filter(patient =>
        new Date(patient.patientDob) <= new Date(dobRange.end!)
      );
    }
    return filtered;
  }

  private filterByStatus(patients: PatientGrid[], statuses: StatusOption[]): PatientGrid[] {
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return patients;
    }
    return patients.filter(patient => {
      // Handle both FormStatusOption objects and string values
      return statuses.some((s: StatusOption | string) => {
        const statusValue = typeof s === 'string' ? s : s.value;
        return patient.formStatus === statusValue;
      });
    });
  }

  private loadAllPatients(): void {
    this.isLoading.set(true);
    // Load all patients by requesting a large page size
    this.rcApiInterface.getPatients(0, 10000).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.allPatients.set(response.data);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading patients:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    // Update pagination state for client-side filtering
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected onClearFilters() {
    this.form().reset({...PATIENT_SEARCH_DATA_DEFAULT});
    this.currentPage.set(0);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
