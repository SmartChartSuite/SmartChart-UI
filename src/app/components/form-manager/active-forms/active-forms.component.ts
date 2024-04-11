import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-active-forms',
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss'
})
export class ActiveFormsComponent implements OnInit {

  displayedColumns: string[] = ["formName", "started", "name", "gender" , 'dob'];
  dataSource: MatTableDataSource<ActiveFormSummary> = new MatTableDataSource<ActiveFormSummary>([]);

  constructor(private rcApiInterfaceService: RcApiInterfaceService) {}
  ngOnInit(): void {
    this.rcApiInterfaceService.getBatchJobs().subscribe({
      next: value => {
        this.dataSource.data = value;
      },
      error: err => {
        console.error(err);
      }
    })
  }

}
