import {Component, Inject, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {FormSummary} from "../../models/form-summary";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {FormsModule} from "@angular/forms";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {PatientGroupsComponent} from "../form-manager/start-new-form/patient-groups/patient-groups.component";
import {PatientSearchComponent} from "../form-manager/start-new-form/patient-search/patient-search.component";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {PatientSummary} from "../../models/patient-summary";
import {UtilsService} from "../../services/utils/utils.service";

@Component({
  selector: 'app-start-new-job-modal',
  imports: [
    MatDialogModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    FormsModule,
    MatTab,
    MatTabGroup,
    PatientGroupsComponent,
    PatientSearchComponent
  ],
  templateUrl: './start-new-job-modal.component.html',
  styleUrl: './start-new-job-modal.component.scss',
})
export class StartNewJobModalComponent {
  dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  data = signal<any | null>(null);
  protected readonly formList = signal<FormSummary[]>([]);
  protected readonly selectedForm = signal<FormSummary | null>(null);
  protected readonly isLoading = signal(false);
  private rcApiInterfaceService = inject(RcApiInterfaceService);
  private formManagerService = inject(FormManagerService);
  private utils = inject(UtilsService);

  protected readonly selectedPatient = toSignal(this.formManagerService.selectedPatient$, {
    initialValue: null
  });

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: any) {}

  getFormList(){
    this.isLoading.set(true);
    this.rcApiInterfaceService.getQuestionTypes$.subscribe({
      next: value => {
        this.formList.set(value);
        if(value.length == 1){
          this.selectedForm.set(value[0]);
        }
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  };

  onStart() {
    const patient = this.selectedPatient();
    const form = this.selectedForm();

    if (!patient || !form) {
      return;
    }

    // TODO: Handle this appropriately, subscription should not happen in this manner. Example of approach can be found in raven upload.
    this.rcApiInterfaceService.startJobs(patient.fhirId, form.name).subscribe({
        next: ()=> {
          this.utils.showSuccessMessage("Job started");
          this.formManagerService.setFormStarted();
          this.dialogRef.close({refreshRequired: true});
        },
        error: err => {
          console.error(err);
          this.utils.showErrorMessage("Server error starting a new job.");
          this.dialogRef.close({refreshRequired: true});
        }
      }
    );
  }

  /** Closes the modal dialog */
  onClose() {
    this.dialogRef.close({refreshRequired: true});
    this.formManagerService.setSelectedPatient(null);
  }

  ngOnInit(): void {
    this.data.set(this.dialogData);
    this.getFormList();
  }
}


export function openStartNewJobModal(dialog: MatDialog, dialogData?: any) {

  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.width = "50vw";
  config.maxWidth = '90vw';
  config.minHeight = "50vh";
  config.maxHeight = "90vh"

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(StartNewJobModalComponent, config);
  // Clean up error state when dialog closes
  dialogRef.afterClosed().subscribe(() => {

  });

  return dialogRef.afterClosed();
}
