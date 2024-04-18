//TODO: extract to proper location
export enum QuestionWidgetType{
  RADIO = 'choice',
  INPUT = 'string',
}


import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-form-viewer',
  templateUrl: './form-viewer.component.html',
  styleUrl: './form-viewer.component.scss'
})
export class FormViewerComponent implements OnInit {

  temp_for_demo: any;
  QuestionWidgetType = QuestionWidgetType;
  showDrawer = false;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private route: ActivatedRoute,
  ) {}

  getJobPackage(formName: string){
    this.rcApiInterfaceService.getJobPackage(formName).subscribe({
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

  ngOnInit(): void {
    let formName = this.route.snapshot.params['formName'];
    this.getJobPackage(formName);
  }

  selectQuestionerSection(item: any) {
    this.temp_for_demo['item'] = this.temp_for_demo.item.map((element: any) => element == item ? {...element, selected: true}: {...element, selected: false});
  }

  onSubmit() {
    console.log(this.temp_for_demo)
  }
}
