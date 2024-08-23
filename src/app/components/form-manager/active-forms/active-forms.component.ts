import {Component, OnInit, signal} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {UtilsService} from "../../../services/utils/utils.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-active-forms',
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss'
})
export class ActiveFormsComponent implements OnInit {

  isLoading = false;
  activeForms: ActiveFormSummary[] = [];
  activeFormsDeepCopy: ActiveFormSummary[] = [];
  readonly panelOpenState = signal(false);

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private utilsService: UtilsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getBatchJobs();
    // Reload the data when a new form is started
    this.formManagerService.formStarted$.subscribe(() => this.getBatchJobs())
  }

  private getBatchJobs() {
    this.isLoading = true;
    this.rcApiInterfaceService.getBatchJobs().subscribe({
      next: value => {
       this.activeForms = value.sort((a,  b) => {
          return (new Date(b.started).getTime()) - (new Date(a.started).getTime()) ;
        });
        this.activeFormsDeepCopy = JSON.parse(JSON.stringify(this.activeForms));
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    });
  }
  onActiveFormSelected(activeFormSummary: ActiveFormSummary) {
    this.formManagerService.setSelectedActiveFormSummary(activeFormSummary);
    this.router.navigate([`/form-viewer`]);
  }

  /**
   * Note: because ActiveFormSummary is not a plain DTO object, and we cannot iterate it using Object.keys()
   * we need to hardcode all filters (keys) and implement each one individually.
    * @param filters
   */
  onFiltersValueChanged(filters: any) {
    let tempResults : ActiveFormSummary[] = JSON.parse(JSON.stringify(this.activeFormsDeepCopy));
    // Implement contains string filter on patient name
    if(filters.name?.length> 0){
      tempResults = this.activeFormsDeepCopy.filter(form=>
        form.patientSummary.name.family?.toLowerCase()?.includes(filters.name.toLowerCase())
        ||
        form.patientSummary.name.given?.toString().toLowerCase()?.includes(filters.name)
      );
    }
    // Gender Filter
    if(filters.gender && !(filters.gender.toString().toLowerCase() == 'any')){
      tempResults = tempResults.filter(form=>
        form.patientSummary.gender.toLowerCase() == filters.gender.toLowerCase()
      );
    }

    // Begin Form Started Date Range filter
    if(filters.startedRange?.start){
      tempResults = tempResults.filter(form=> {
         new Date(form.started) >= new Date(filters.startedRange?.start);
        }
      );
    }
    if(filters.startedRange?.end){
      tempResults = tempResults.filter(form=>
        new Date(form.started) <= new Date (filters.startedRange?.end)
      );
    }
    // End Form Started Date Range filter

    // Begin PatientDoB Date Range filter
    if(filters.dobRange?.dobStart){
      tempResults = tempResults.filter(form=>
          new Date(form.patientSummary.birthDate) >= new Date(filters.dobRange?.dobStart)
      );
    }
    if(filters.dobRange?.dobEnd){
      tempResults = tempResults.filter(form=>
        new Date(form.patientSummary.birthDate) <= new Date(filters.dobRange?.dobEnd)
      );
    }
    if(filters.formName && !(filters.formName.name.toString().toLowerCase() == 'any')){
      tempResults = tempResults.filter(form=>
        form.formName == filters.formName.name || form.formName == filters.formName.title
      );
    }
    //TODO Implement Status Filter
    this.activeForms = tempResults;
  }
}
