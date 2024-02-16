import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {SearchByType, searchByTypes} from "../../models/search-by-types";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent implements OnChanges, OnInit {

  // User fills out either identifier ** OR ** name/birthdate. These are mutually exclusive.
  // Form gives query parameters. See src/app/models/rc-api/patient-search-parameters.ts.
  @Input() selectedSearchCriteria: SearchByType = SearchByType.IDENTIFIER;

  searchTypeList: SearchByType[] = searchByTypes;

  searchForm: FormGroup = new FormGroup<any>({});

  protected readonly TYPE_SYSTEM_LIST: string[] = ['mrn', 'test'];

  // search by Identifier controls
  identifierFc: FormControl = new FormControl(null, [Validators.required]);
  typeSystemFc: FormControl = new FormControl(this.TYPE_SYSTEM_LIST[0], Validators.required);

  // search by Name and DoB controls
  givenFc: FormControl = new FormControl("", Validators.required);
  familyFc: FormControl = new FormControl("", Validators.required);
  dobFc: FormControl = new FormControl("", Validators.required);

  // search by FHIR ID controls
  fhirIdFc: FormControl = new FormControl("", Validators.required);

  onSearchBySelected($event: MatRadioChange) {
    console.log($event.value);
    this.constructForm($event.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedSearchCriteria']?.currentValue){
      this.constructForm(this.selectedSearchCriteria);
    }
  }

  ngOnInit(): void {
    this.constructForm(this.selectedSearchCriteria);
  }

  private constructForm(selectedSearchCriteria: SearchByType) {

    if(selectedSearchCriteria == SearchByType.IDENTIFIER){
      this.searchForm = new FormGroup<any>({
        identifier: this.identifierFc,
        typeSystem: this.typeSystemFc
      });
    }
    else if(selectedSearchCriteria == SearchByType.NAME_AND_DOB){
      this.searchForm = new FormGroup<any>({
        given: this.givenFc,
        family: this.familyFc,
        dob: this.dobFc
      });
    }
    else if (selectedSearchCriteria == SearchByType.FHIR_ID){
      this.searchForm = new FormGroup<any>({
        fhirId: this.fhirIdFc,
      });
    }
    else {
      console.warn(`Invalid selectedSearchCriteria ${selectedSearchCriteria}`);
    }
  }

  onSubmit() {
    console.log(this.searchForm);
  }

  protected readonly SearchByType = SearchByType;
}
