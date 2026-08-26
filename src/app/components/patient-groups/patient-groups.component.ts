import {Component, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import { PatientSummary } from '../../models/patient-summary';
import { PatientGroup } from '../../models/patient-group';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import { MatSelectChange, MatSelect, MatOption } from "@angular/material/select";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {UtilsService} from "../../services/utils/utils.service";
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { PatientSummaryTableComponent } from '../patient-summary-table/patient-summary-table.component';

@Component({
    selector: 'app-patient-groups',
    templateUrl: './patient-groups.component.html',
    styleUrl: './patient-groups.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, PatientSummaryTableComponent]
})
export class PatientGroupsComponent implements OnInit{
  patientGroups = signal<PatientGroup[]>([]);
  selectedGroup = signal<PatientGroup | undefined>(undefined);
  patientSummaryData = signal<PatientSummary[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private utilsService: UtilsService,
  ){}


  ngOnInit(): void {
    this.isLoading.set(true);
    this.rcApiInterfaceService.searchGroup().subscribe({
      next: value => {
        this.patientGroups.set(value);
        this.selectedGroup.set(this.patientGroups()?.[0]);
        this.patientSummaryData.set(this.selectedGroup()?.members);
        this.isLoading.set(false);
      },
      error: err => {
        this.utilsService.showErrorMessage();
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onGroupSelected(event: MatSelectChange<PatientGroup>) {
    this.selectedGroup.set(event.value);
    this.formManagerService.setSelectedPatient(null);
    this.patientSummaryData.set(event.value.members);
  }
}
