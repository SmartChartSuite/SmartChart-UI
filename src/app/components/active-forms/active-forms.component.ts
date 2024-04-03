import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";
import {ActiveFormSummary} from "../../models/active-form-summary";

@Component({
  selector: 'app-active-forms',
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss'
})
export class ActiveFormsComponent implements OnInit {

  batchJobs$: Observable<ActiveFormSummary[]>;
  constructor(private rcApiInterfaceService: RcApiInterfaceService) {}
  ngOnInit(): void {
      this.batchJobs$ = this.rcApiInterfaceService.getBatchJobs()
  }

}
