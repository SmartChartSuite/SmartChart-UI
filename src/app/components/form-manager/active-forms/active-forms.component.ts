import {Component, OnInit} from '@angular/core';
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

  onFiltersValueChanged(event: any) {
    console.log(event);
  }
}
