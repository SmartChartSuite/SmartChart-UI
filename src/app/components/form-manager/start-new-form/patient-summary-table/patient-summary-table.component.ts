import {
  AfterViewInit,
  Component,
  Input,
  OnChanges, OnInit,
  SimpleChanges, ViewChild,
} from '@angular/core';
import {PatientSummary} from "../../../../models/patient-summary";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import {Observable} from "rxjs";
import {FormManagerService} from "../../../../services/form-manager/form-manager.service";
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-patient-summary-table',
    templateUrl: './patient-summary-table.component.html',
    styleUrl: './patient-summary-table.component.scss',
    imports: [MatTableModule, MatPaginatorModule, MatIcon, AsyncPipe, TitleCasePipe, DatePipe]
})
export class PatientSummaryTableComponent implements OnChanges, AfterViewInit, OnInit {

  constructor(private formManagerService: FormManagerService) {
  }

  ngOnInit(): void {
    this.selectedPatient$ = this.formManagerService.selectedPatient$
  }

  @Input() patientSummaryData: PatientSummary[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ["selection", "name", "gender", "birthDate"];
  dataSource: MatTableDataSource<PatientSummary> = new MatTableDataSource<PatientSummary>([]);
  selectedPatient$: Observable<PatientSummary>;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['patientSummaryData']?.currentValue){
      this.dataSource.data = this.patientSummaryData;
      this.dataSource.paginator?.firstPage();
    }
  }
  setSelectedPatient(patient: PatientSummary) {
    this.formManagerService.setSelectedPatient(patient);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
