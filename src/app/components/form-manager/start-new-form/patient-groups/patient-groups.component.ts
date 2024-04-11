import {Component, OnInit} from '@angular/core';
import { PatientSummary } from '../../../../models/patient-summary';
import { PatientGroup } from '../../../../models/patient-group';
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {MatSelectChange} from "@angular/material/select";
import {FormManagerService} from "../../../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-patient-groups',
  templateUrl: './patient-groups.component.html',
  styleUrl: './patient-groups.component.scss'
})
export class PatientGroupsComponent implements OnInit{
  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService
  ){}

  patientSummaryData: PatientSummary[];
  selectedGroup: PatientGroup;
  patientGroups: PatientGroup[];

  ngOnInit(): void {
    this.rcApiInterfaceService.searchGroup().subscribe({
      next: value => {
        this.patientGroups = value;
        this.selectedGroup = this.patientGroups?.[0];
        this.patientSummaryData = this.selectedGroup?.members;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  onGroupSelected(event: MatSelectChange) {
    this.formManagerService.setSelectedPatient(null);
    this.patientSummaryData = event.value.members;
  }
}
