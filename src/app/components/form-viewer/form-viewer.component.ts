import {FormControl, FormGroup} from "@angular/forms";

export enum QuestionWidgetType{
  CHECKBOX = 'choice',
  INPUT = 'string'
}


import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit {

  temp_for_demo: any;
  QuestionWidgetType = QuestionWidgetType;

  constructor(private rcApiInterfaceService: RcApiInterfaceService) {}

  ngOnInit(): void {
    // TODO: Change this to not be static, once linked to the input should be based on the FormSummary name (NOT title)
    this.rcApiInterfaceService.getJobPackage("SETNETInfantFollowUp").subscribe({
      next: result => {
        result['item'] = result['item']?.map((item: any) => {return {...item, answer: null}});
        result['item'] = result['item']?.map((item: any, index: number) => {
          return index == 0 ? {...item, selected: true} : {...item, selected: false}
        });
        console.log(result);
        this.temp_for_demo = result;
      }
    });
  }

  buildFormFromItems(){

  }

  selectQuestionerSection(item: any) {
    this.temp_for_demo['item'] = this.temp_for_demo.item.map((element: any) => element == item ? {...element, selected: true}: {...element, selected: false});
  }

  onSubmit() {
    console.log(this.temp_for_demo)
  }
}
