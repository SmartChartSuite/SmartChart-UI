import {Component, computed, DestroyRef, Inject, inject, OnInit, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {FormSummary} from "../../models/form-summary";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {PatientGroupsComponent} from "../patient-groups/patient-groups.component";
import {PatientSearchComponent} from "../patient-search/patient-search.component";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {UtilsService} from "../../services/utils/utils.service";
import {MatTooltip} from "@angular/material/tooltip";
import {HttpErrorService} from '../../services/http-error/http-error.service';
import {ErrorMessageComponent} from '../error-message/error-message.component';

@Component({
  selector: 'app-start-new-job-modal',
  imports: [
    MatDialogModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTab,
    MatTabGroup,
    PatientGroupsComponent,
    PatientSearchComponent,
    MatTooltip,
    ErrorMessageComponent
  ],
  templateUrl: './start-new-job-modal.component.html',
  styleUrl: './start-new-job-modal.component.scss',
})
export class StartNewJobModalComponent implements OnInit {
  dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  data = signal<any | null>(null);
  protected readonly formList = signal<FormSummary[]>([]);
  protected readonly selectedForm = signal<FormSummary | null>(null);
  protected readonly formSearch = signal('');
  protected readonly filteredFormNames = computed(() => {
    const search = this.formSearch().trim().toLowerCase();

    if (!search) {
      return this.formList();
    }

    return this.formList().filter(form =>
      form.name.toLowerCase().includes(search) ||
      form.title.toLowerCase().includes(search)
    );
  });

  protected readonly isLoading = signal(false);
  private rcApiInterfaceService = inject(RcApiInterfaceService);
  private formManagerService = inject(FormManagerService);
  private utils = inject(UtilsService);
  protected readonly httpErrorService = inject(HttpErrorService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedPatient = toSignal(this.formManagerService.selectedPatient$, {
    initialValue: null
  });

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: any) {
    const deactivateModalErrorScope = this.httpErrorService.activateModalErrorScope();
    this.destroyRef.onDestroy(deactivateModalErrorScope);
  }

  getFormList(){
    this.isLoading.set(true);
    this.rcApiInterfaceService.getFormNames$.subscribe({
      next: value => {
        this.formList.set(value);
        if(value.length == 1){
          this.selectedForm.set(value[0]);
          this.formSearch.set(value[0].title);
        }
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  };

  protected onFormInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.formSearch.set(value);

    if (value !== this.selectedForm()?.title) {
      this.selectedForm.set(null);
    }
  }

  protected onFormSelected(formName: string): void {
    const selectedForm = this.formList().find(form => form.name === formName) ?? null;
    this.selectedForm.set(selectedForm);
    this.formSearch.set(selectedForm?.title ?? '');
  }

  protected displayFormName = (formName: string | null): string => {
    if (!formName) {
      return '';
    }

    return this.formList().find(form => form.name === formName)?.title ?? formName;
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
        }
      }
    );
  }

  /** Closes the modal dialog */
  onClose() {
    this.dialogRef.close({refreshRequired: false});
    this.formManagerService.setSelectedPatient(null);
  }

  protected clearError(): void {
    this.httpErrorService.clearModalError();
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
