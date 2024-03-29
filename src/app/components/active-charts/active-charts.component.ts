import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-active-charts',
  templateUrl: './active-charts.component.html',
  styleUrl: './active-charts.component.scss'
})
export class ActiveChartsComponent implements OnInit {

  batchJobs$: Observable<any>;
  constructor(private rcApiInterfaceService: RcApiInterfaceService) {}
  ngOnInit(): void {
      this.batchJobs$ = this.rcApiInterfaceService.getBatchJobs()
  }

}
