import {
  AfterViewInit,
  Component,
  Input,
  OnChanges, OnInit,
  SimpleChanges, ViewChild,
} from '@angular/core';
import {PatientSummary} from "../../models/patient-summary";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-patient-summary-table',
  templateUrl: './patient-summary-table.component.html',
  styleUrl: './patient-summary-table.component.scss'
})
export class PatientSummaryTableComponent implements OnChanges, AfterViewInit, OnInit {

  constructor(private rcApiInterfaceService: RcApiInterfaceService) {
  }

  ngOnInit(): void {
    this.selectedPatient$ = this.rcApiInterfaceService.selectedPatient$
  }

  @Input() patientSummaryData: PatientSummary[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = [ "name", "gender", "birthDate"];
  dataSource: MatTableDataSource<PatientSummary> = new MatTableDataSource<PatientSummary>([]);
  selectedPatient$: Observable<PatientSummary>;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['patientSummaryData']?.currentValue){
      this.dataSource.data = this.patientSummaryData;
      this.dataSource.paginator?.firstPage();
    }
  }
  setSelectedPatient(patient: PatientSummary) {
    this.rcApiInterfaceService.setSelectedPatient(patient);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
