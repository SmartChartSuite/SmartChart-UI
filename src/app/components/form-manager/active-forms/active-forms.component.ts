import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {UtilsService} from "../../../services/utils/utils.service";
import {FormControl, FormGroup} from "@angular/forms";
export const Gender = ["Male", "Female", "Other", "Unknown"];
export const Status = ["any", "active"]
@Component({
  selector: 'app-active-forms',
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss'
})
export class ActiveFormsComponent implements OnInit {

  displayedColumns: string[] = ["name", "gender", "dob", "formName", "started" ];
  dataSource: MatTableDataSource<ActiveFormSummary> = new MatTableDataSource<ActiveFormSummary>([]);
  isLoading = false;

  readonly GENDER_LIST = Gender;
  readonly STATUS_LIST = Status;
  formNameList : string[] = [];

  dobRange = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  startedRange = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  searchResultsForm = new FormGroup({
    patientName: new FormControl(''),
    gender: new FormControl(this.GENDER_LIST[0]),
    dobRange: new FormControl('', this.dobRange),
    name: new FormControl(''),
    startedRange: new FormControl('', this.startedRange),
    status: new FormControl(this.GENDER_LIST[0]),
  });

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private router: Router,
    private utilsService: UtilsService
  ) {}

  getFormList(){
    this.isLoading = true;
    this.rcApiInterfaceService.getSmartChartUiQuestionnaires().subscribe({
      next: value => {
       // this.formNameList = value.unshift('Any');
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.utilsService.showErrorMessage();
        console.error(err);
      }
    });
  }
  ngOnInit(): void {
    this.getBatchJobs();

    // Reload the data when a new form is started
    this.formManagerService.formStarted$.subscribe(() => this.getBatchJobs())
  }

  private getBatchJobs() {
    this.isLoading = true;
    this.rcApiInterfaceService.getBatchJobs().subscribe({
      next: value => {
        this.dataSource.data = value.sort((a,  b) => {
          return (new Date(b.started).getTime()) - (new Date(a.started).getTime()) ;
        });
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error(err);
        this.utilsService.showErrorMessage();
      }
    })
  }

  onActiveFormSelected(activeFormSummary: ActiveFormSummary) {
    this.formManagerService.setSelectedActiveFormSummary(activeFormSummary);
    this.router.navigate([`/form-viewer`]);
  }

  onSubmit() {

  }
}
