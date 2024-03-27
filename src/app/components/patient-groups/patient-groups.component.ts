import {Component, OnInit} from '@angular/core';
import { PatientSummary } from 'src/app/models/patient-summary';
import { PatientGroup } from 'src/app/models/patient-group';
import {Observable} from "rxjs";
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
  patientGroups$: Observable<PatientGroup[]>;
  patientSummaryData: PatientSummary[];
  onPatientSelected(patient: PatientSummary) {
    this.selectedPatient = patient;
  }

  ngOnInit(): void {
    this.patientGroups$ = this.rcApiInterfaceService.searchGroup();
  }

  onGroupSelected(event: MatSelectChange) {
    this.patientSummaryData = event.value.members;
  }
}
