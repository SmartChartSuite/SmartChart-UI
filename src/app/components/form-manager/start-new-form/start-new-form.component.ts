import {Component, OnInit} from '@angular/core';
import {PatientSummary} from "../../../models/patient-summary";
import {FormSummary} from "../../../models/form-summary";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {UtilsService} from "../../../services/utils/utils.service";
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { PatientGroupsComponent } from './patient-groups/patient-groups.component';
import { FormSelectionComponent } from './form-selection/form-selection.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-start-new-form',
    templateUrl: './start-new-form.component.html',
    styleUrl: './start-new-form.component.scss',
    imports: [MatCard, MatCardContent, MatTabGroup, MatTab, PatientSearchComponent, PatientGroupsComponent, FormSelectionComponent, MatTooltip, MatButton, MatIcon]
})
export class StartNewFormComponent implements OnInit {
  selectedPatient: PatientSummary;
  selectedForm: FormSummary;

  constructor(
    private formManagerService: FormManagerService,
    private rcApiInterfaceService: RcApiInterfaceService,
    private utilsService: UtilsService
    ) {
  }


  ngOnInit(): void {
    this.formManagerService.selectedPatient$
      .subscribe(value => this.selectedPatient = value);

    this.formManagerService.selectedForm$
      .subscribe(value => this.selectedForm = value);


    // Track Job Start When Triggered.
  }

  onStartJob() {
    // TODO: Handle this appropriately, subscription should not happen in this manner. Example of approach can be found in raven upload.
    this.rcApiInterfaceService.startJobs(this.selectedPatient.fhirId, this.selectedForm.name).subscribe({
        next: ()=> {
          this.utilsService.showSuccessMessage("Job started");
          this.formManagerService.setFormStarted();
        },
        error: err => {
          console.error(err);
          this.utilsService.showErrorMessage("Server error starting a new job.")
        }
      }
    );
  }

}
