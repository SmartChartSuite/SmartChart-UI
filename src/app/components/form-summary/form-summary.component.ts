import {Component, computed, effect, inject, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {Button} from "primeng/button";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {DatePipe} from "@angular/common";
import {FormStatus, FormStatusOption, STATUS_OPTIONS} from "../../models/form-status";
import {PatientGrid} from "../../models/patient-grid";
import {form, FormField, FormRoot} from "@angular/forms/signals";
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {MultiSelect} from "primeng/multiselect";
import {DatePicker} from "primeng/datepicker";
import {Tooltip} from "primeng/tooltip";
import {FormStatusDisplayPipe} from "../../pipe/form-status-display.pipe";
import {
  GENDER_OPTIONS,
  GenderOption,
  PatientSearchData,
  PATIENT_SEARCH_DATA_DEFAULT
} from "../../models/patient-search-data";

@Component({
  selector: 'app-form-summary',
  imports: [
    Button,
    TableModule,
    DatePipe,
    FloatLabel,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    FormRoot,
    FormField,
    MultiSelect,
    DatePicker,
    Tooltip,
    FormStatusDisplayPipe
  ],
  templateUrl: './form-summary.component.html',
  styleUrl: './form-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FormSummaryComponent implements OnInit {
  protected readonly FormStatus = FormStatus;
  protected readonly GENDER_OPTIONS = [...GENDER_OPTIONS];
  protected readonly STATUS_OPTIONS = [...STATUS_OPTIONS];

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

  // Separate signal for date range since form API doesn't support array types well
  dobRangeValue = signal<Date[] | null>(null);

  // Computed signal for filtered patients based on form values
  private readonly filteredPatients = computed(() => {
    const allPts = this.allPatients();
    const formValue = this.form().value();
    const dobRange = this.dobRangeValue(); // Track dobRangeValue signal

    let filtered = [...allPts];

    filtered = this.filterByName(filtered, formValue.patientName);
    filtered = this.filterByGender(filtered, formValue.gender);
    filtered = this.filterByDobRange(filtered, dobRange );
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

  constructor() {
    effect(() => {
      console.log(this.form().value());
      // Reset to first page when filters change
      this.currentPage.set(0);
    });
  }

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

  private filterByDobRange(patients: PatientGrid[], dobRange: Date[] | null): PatientGrid[] {
    if (!dobRange || !Array.isArray(dobRange) || dobRange.length === 0) {
      return patients;
    }

    let filtered = patients;
    if (dobRange[0]) {
      filtered = filtered.filter(patient =>
        new Date(patient.patientDob) >= new Date(dobRange[0])
      );
    }
    if (dobRange[1]) {
      filtered = filtered.filter(patient =>
        new Date(patient.patientDob) <= new Date(dobRange[1])
      );
    }
    return filtered;
  }

  private filterByStatus(patients: PatientGrid[], statuses: FormStatusOption[]): PatientGrid[] {
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return patients;
    }
    return patients.filter(patient => {
      // Handle both FormStatusOption objects and string values
      return statuses.some((s: FormStatusOption | string) => {
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

  loadPatients(event: TableLazyLoadEvent): void {
    // Update pagination state for client-side filtering
    this.currentPage.set((event.first ?? 0) / (event.rows ?? 10));
    this.pageSize.set(event.rows ?? 10);
  }

  onDobRangeChange(value: Date[] | null): void {
    this.dobRangeValue.set(value);
    this.currentPage.set(0);
  }

  protected onClearFilters() {
    this.form().reset({...PATIENT_SEARCH_DATA_DEFAULT});
    this.dobRangeValue.set(null);
  }
}
