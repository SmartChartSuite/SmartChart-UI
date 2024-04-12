import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit {

  temp_for_demo: any;
  constructor(private rcApiInterfaceService: RcApiInterfaceService) {}

  ngOnInit(): void {
    // TODO: Change this to not be static, once linked to the input should be based on the FormSummary name (NOT title)
    this.rcApiInterfaceService.getJobPackage("SETNETInfantFollowUp").subscribe({
      next: value => {console.log(value); this.temp_for_demo = value}
    })
    }
}
