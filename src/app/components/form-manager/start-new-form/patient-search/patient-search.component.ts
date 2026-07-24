import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { MatRadioChange, MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import {searchByType, searchByTypes} from "../../../../models/search-by-types";
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {PatientSummary} from "../../../../models/patient-summary";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {PatientSearchParameters} from "../../../../models/rc-api/patient-search-parameters";
import {UtilsService} from "../../../../services/utils/utils.service";
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatLabel, MatFormField, MatError, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { PatientSummaryTableComponent } from '../patient-summary-table/patient-summary-table.component';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-patient-search',
    templateUrl: './patient-search.component.html',
    styleUrl: './patient-search.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardContent, MatLabel, MatRadioGroup, FormsModule, MatRadioButton, ReactiveFormsModule, MatFormField, MatInput, MatError, MatButton, MatIcon, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatHint, PatientSummaryTableComponent, DatePipe]
})
export class PatientSearchComponent implements OnInit, OnDestroy {

  protected readonly SearchByType = searchByType;

  searchTypeList: searchByType[] = searchByTypes;

  searchForm: FormGroup;

  patientSummaryData: PatientSummary[];

  searchExecuted: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private utilsService: UtilsService
  ){
    // Initialize single form with all controls including selectedSearchCriteria
    this.searchForm = new FormGroup({
      selectedSearchCriteria: new FormControl(searchByType.IDENTIFIER),
      identifier: new FormControl(null),
      given: new FormControl(''),
      family: new FormControl(''),
      dob: new FormControl(''),
      fhirId: new FormControl('')
    });
  }

  ngOnInit(): void {
    // Subscribe to selectedSearchCriteria changes to update validators
    this.searchForm.get('selectedSearchCriteria')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: searchByType) => {
        console.log(value);
        this.updateFormValidators(value);
      });

    // Initialize validators based on default value
    this.updateFormValidators(this.searchForm.get('selectedSearchCriteria')?.value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFormValidators(selectedSearchCriteria: searchByType) {
    // Clear all validators first
    const fieldsToReset = ['identifier', 'given', 'family', 'dob', 'fhirId'];
    fieldsToReset.forEach(field => {
      const control = this.searchForm.get(field);
      control?.clearValidators();
      control?.setValue(null, { emitEvent: false });
      control?.updateValueAndValidity({ emitEvent: false });
    });

    // DON'T set validators here - the form will always be valid when no validators exist

    // Mark form as pristine and untouched
    this.searchForm.markAsPristine();
    this.searchForm.markAsUntouched();

    console.log(this.searchForm.valid); // Will now be TRUE
  }

  private applyValidatorsForSearchCriteria(selectedSearchCriteria: searchByType) {
    if(selectedSearchCriteria == searchByType.IDENTIFIER){
      this.searchForm.get('identifier')?.setValidators([Validators.required]);
      this.searchForm.get('identifier')?.updateValueAndValidity();
    }
    else if(selectedSearchCriteria == searchByType.NAME_AND_DOB){
      this.searchForm.get('given')?.setValidators([Validators.required]);
      this.searchForm.get('family')?.setValidators([Validators.required]);
      this.searchForm.get('dob')?.setValidators([Validators.required]);
      this.searchForm.get('given')?.updateValueAndValidity();
      this.searchForm.get('family')?.updateValueAndValidity();
      this.searchForm.get('dob')?.updateValueAndValidity();
    }
    else if (selectedSearchCriteria == searchByType.FHIR_ID){
      this.searchForm.get('fhirId')?.setValidators([Validators.required]);
      this.searchForm.get('fhirId')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    const selectedSearchCriteria = this.searchForm.get('selectedSearchCriteria')?.value;

    // Apply validators before validation
    this.applyValidatorsForSearchCriteria(selectedSearchCriteria);

    this.searchForm.markAllAsTouched();

    if(this.searchForm.valid){
      // Build search parameters based on selected criteria
      const searchParameters = this.buildSearchParameters(selectedSearchCriteria);
      this.executeSearch(searchParameters);
    }
  }

  private buildSearchParameters(searchCriteria: searchByType): PatientSearchParameters {
    let searchParams = new PatientSearchParameters();

    switch (searchCriteria) {
      case searchByType.IDENTIFIER:
        const identifier = this.searchForm.get('identifier')?.value;
        if (identifier) {
          searchParams = searchParams.set('identifier', identifier) as PatientSearchParameters;
        }
        break;

      case searchByType.NAME_AND_DOB:
        const given = this.searchForm.get('given')?.value;
        const family = this.searchForm.get('family')?.value;
        const dob = this.searchForm.get('dob')?.value;

        if (given) {
          searchParams = searchParams.set('given', given) as PatientSearchParameters;
        }
        if (family) {
          searchParams = searchParams.set('family', family) as PatientSearchParameters;
        }
        if (dob) {
          // Format date as YYYY-MM-DD
          const formattedDate = dob instanceof Date
            ? dob.toISOString().split('T')[0]
            : dob;
          searchParams = searchParams.set('birthdate', formattedDate) as PatientSearchParameters;
        }
        break;

      case searchByType.FHIR_ID:
        const fhirId = this.searchForm.get('fhirId')?.value;
        if (fhirId) {
          searchParams = searchParams.set('_id', fhirId) as PatientSearchParameters;
        }
        break;
    }

    return searchParams;
  }

  private executeSearch(searchParams: PatientSearchParameters) {
    this.rcApiInterfaceService.searchPatient(searchParams).subscribe({
      next: value => {
        this.patientSummaryData = value;
        this.searchExecuted = true;
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    });
  }
}
