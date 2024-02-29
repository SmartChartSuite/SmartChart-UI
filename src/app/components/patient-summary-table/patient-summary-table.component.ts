import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges, ViewChild,
} from '@angular/core';
import {PatientSummary} from "../../models/patient-summary";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-patient-summary-table',
  templateUrl: './patient-summary-table.component.html',
  styleUrl: './patient-summary-table.component.scss'
})
export class PatientSummaryTableComponent implements OnChanges, AfterViewInit {

  @Input() selectedPatient: PatientSummary | null;
  @Input() patientSummaryData: PatientSummary[] = [];

  @Output() patientSelectedEvent: EventEmitter<PatientSummary> = new EventEmitter<PatientSummary>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = [ "name", "gender", "birthDate"];
  dataSource: MatTableDataSource<PatientSummary> = new MatTableDataSource<PatientSummary>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['patientSummaryData']?.currentValue){
      this.dataSource.data = this.patientSummaryData;
      this.dataSource.paginator.firstPage();
    }
  }
  setSelectedPatient(patient: PatientSummary) {
    this.patientSelectedEvent.emit(patient);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
