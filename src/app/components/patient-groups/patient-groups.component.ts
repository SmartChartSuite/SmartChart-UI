import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";

@Component({
  selector: 'app-patient-groups',
  templateUrl: './patient-groups.component.html',
  styleUrl: './patient-groups.component.scss'
})
export class PatientGroupsComponent implements OnInit{

  constructor(private rcApiInterface: RcApiInterfaceService) {
  }

  ngOnInit() {
    this.rcApiInterface.searchGroup().subscribe({
      next: value => console.log(value)
    })
  }

}
