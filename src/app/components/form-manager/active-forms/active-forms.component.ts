import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-active-forms',
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss'
})
export class ActiveFormsComponent implements OnInit {

  displayedColumns: string[] = ["name", "gender", 'dob', "formName", "started" ];
  dataSource: MatTableDataSource<ActiveFormSummary> = new MatTableDataSource<ActiveFormSummary>([]);
  isLoading = false;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.getBatchJobs();
  }


  private getBatchJobs() {
    this.isLoading = true;
    this.rcApiInterfaceService.getBatchJobs().subscribe({
      next: value => {
        this.dataSource.data = value;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }

  onActiveFormSelected(activeFormSummary: ActiveFormSummary) {
    this.formManagerService.setSelectedActiveFormSummary(activeFormSummary);
    this.router.navigate([`/form-viewer`]);
  }
}
