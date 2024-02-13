import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit{
  constructor(private rcApiInterfaceService: RcApiInterfaceService){}

  ngOnInit(): void {
    const result = this.rcApiInterfaceService.searchPatient().subscribe({
      next: value => {
        console.log(value)
      }
    });
  }
}
