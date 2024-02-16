import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {PatientSummary} from "../../models/patient-summary";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-patient-summary-table',
  templateUrl: './patient-summary-table.component.html',
  styleUrl: './patient-summary-table.component.scss'
})
export class PatientSummaryTableComponent implements OnChanges {

  @Input() selectedPatient: PatientSummary | null;
  @Input() patientSummaryData: PatientSummary[] = [];

  @Output() patientSelectedEvent: EventEmitter<PatientSummary> = new EventEmitter<PatientSummary>();

  displayedColumns: string[] = [ "name", "gender", "birthDate"];
  dataSource: MatTableDataSource<PatientSummary>;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['patientSummaryData']?.currentValue){
      this.dataSource.data = this.patientSummaryData;
    }
  }
  setSelectedPatient(patient: PatientSummary) {
    this.patientSelectedEvent.emit(patient);
  }

}
