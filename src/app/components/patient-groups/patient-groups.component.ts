import {Component, OnInit} from '@angular/core';
import { PatientSummary } from 'src/app/models/patient-summary';
import { PatientGroup } from 'src/app/models/patient-group';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {MatSelectChange} from "@angular/material/select";

@Component({
  selector: 'app-patient-groups',
  templateUrl: './patient-groups.component.html',
  styleUrl: './patient-groups.component.scss'
})
export class PatientGroupsComponent implements OnInit{

  constructor(private rcApiInterfaceService: RcApiInterfaceService){}

  selectedPatient: PatientSummary | null;
  patientSummaryData: PatientSummary[];
  selectedGroup: PatientGroup;
  patientGroups: PatientGroup[];
  onPatientSelected(patient: PatientSummary) {
    this.selectedPatient = patient;
  }

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
    })
  }

  onGroupSelected(event: MatSelectChange) {
    this.patientSummaryData = event.value.members;
  }
}
