import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {searchByType, searchByTypes} from "../../../../models/search-by-types";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PatientSummary} from "../../../../models/patient-summary";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {PatientSearchParameters} from "../../../../models/rc-api/patient-search-parameters";
import {UtilsService} from "../../../../services/utils/utils.service";

@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent implements OnChanges, OnInit {

  // User fills out either identifier ** OR ** name/birthdate. These are mutually exclusive.
  // Form gives query parameters. See src/app/models/rc-api/patient-search-parameters.ts.
  @Input() selectedSearchCriteria: searchByType = searchByType.IDENTIFIER;

  // protected readonly SYSTEM_TYPE_LIST: string[] = ['mrn', 'test'];

  protected readonly SearchByType = searchByType;

  searchTypeList: searchByType[] = searchByTypes;

  searchForm: FormGroup = new FormGroup<any>({});

  patientSummaryData: PatientSummary[];

  // Search by Identifier controls
  identifierFc: FormControl = new FormControl(null, [Validators.required]);
  // typeSystemFc: FormControl = new FormControl(this.SYSTEM_TYPE_LIST[0], Validators.required);

  // Search by Name and DoB controls
  givenFc: FormControl = new FormControl("", Validators.required);
  familyFc: FormControl = new FormControl("", Validators.required);
  dobFc: FormControl = new FormControl("", Validators.required);

  // Search by FHIR ID controls
  fhirIdFc: FormControl = new FormControl("", Validators.required);
  searchExecuted: boolean = false;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private utilsService: UtilsService
    ){}

  onSearchBySelected($event: MatRadioChange) {
    this.createSearchForm($event.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedSearchCriteria']?.currentValue){
      this.searchExecuted = false;
      this.createSearchForm(this.selectedSearchCriteria);
    }
  }

  ngOnInit(): void {
    this.createSearchForm(this.selectedSearchCriteria);
  }

  private createSearchForm(selectedSearchCriteria: searchByType) {
    this.searchForm.reset()

    if(selectedSearchCriteria == searchByType.IDENTIFIER){
      this.searchForm = new FormGroup<any>({
        identifier: this.identifierFc,
        // typeSystem: this.typeSystemFc
      });
    }
    else if(selectedSearchCriteria == searchByType.NAME_AND_DOB){
      this.searchForm = new FormGroup<any>({
        given: this.givenFc,
        family: this.familyFc,
        dob: this.dobFc
      });
    }
    else if (selectedSearchCriteria == searchByType.FHIR_ID){
      this.searchForm = new FormGroup<any>({
        fhirId: this.fhirIdFc,
      });
    }
    else {
      console.warn(`Invalid selectedSearchCriteria ${selectedSearchCriteria}`);
    }
  }

  onSubmit() {
    this.searchForm.markAllAsTouched(); //Trigger manual submit
    if(this.searchForm.status == 'VALID'){
      this.executeSearch(this.searchForm.value);
    }
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
