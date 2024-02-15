import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {StartJobsPostResponse, StartJobsPostResponseKeys} from "../../../models/rc-api/start-jobs-post-response";
import {Parameters} from "../../../models/rc-api/fhir.parameters.resource";
import {mergeMap} from "rxjs";
import {FhirBaseResource} from "../../../models/rc-api/fhir.base.resource";

@Component({
  selector: 'app-rc-api-test-component',
  standalone: true,
  imports: [],
  templateUrl: './rc-api-test-component.component.html',
  styleUrl: './rc-api-test-component.component.scss'
})
export class RcApiTestComponent implements OnInit {

  constructor(private rcApiInterface: RcApiInterfaceService) {}

  ngOnInit() {
    // console.log("Huh");
    //
    // this.rcApiInterface.searchGroup().subscribe({
    //   next: value => {console.log(value)}
    // })
    //
    // this.rcApiInterface.searchQuestionnaire().subscribe({
    //   next: value=> {console.log(value)}
    // })
    const patientId = "625171";
    const jobPackage= "SyphilisRegistry";

    this.rcApiInterface.getJobPackage(jobPackage).pipe(
      mergeMap((value: FhirBaseResource) => {
        console.log(value?.["extension"]);
        // Call each job in extension list.
        // Merge into single stream? Need to see best observable approach for this.
        return this.rcApiInterface.startJobs(patientId, jobPackage, "demographics")
      })
    ).subscribe({
      next: value => {},
      error: err => { console.error(err)}
    })

    // this.rcApiInterface.startJobs(patientId, jobPackage, "demographics").subscribe(
    //   {
    //     next: (value: StartJobsPostResponse) => {
    //       console.log(Parameters.getValue(value, StartJobsPostResponseKeys.JOB_ID));
    //       console.log(Parameters.getValue(value, StartJobsPostResponseKeys.JOB_START_DATE_TIME));
    //       console.log(Parameters.getValue(value, StartJobsPostResponseKeys.JOB_STATUS));
    //       console.log(Parameters.getValue(value, StartJobsPostResponseKeys.RESULT));
    //     }
    //   }
    // )
  }

}
