import { Injectable } from '@angular/core';
import {ConfigService} from "../config/config.service";
import {map, Observable, of, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {FhirBaseResource} from "../../models/rc-api/fhir.base.resource";
import {StartJobsPostBody} from "../../models/rc-api/start-jobs-post-body";
import {StartJobsPostResponse} from "../../models/rc-api/start-jobs-post-response";
import {PatientSearchParameters} from "../../models/rc-api/patient-search-parameters";
import {PatientSummary} from "../../models/patient-summary";
import {PatientGroup} from "../../models/patient-group";
import {FormSummary} from "../../models/form-summary";
import {ActiveFormSummary} from "../../models/active-form-summary";
import {Parameters} from "../../models/rc-api/fhir.parameters.resource";

@Injectable({
  providedIn: 'root'
})
export class RcApiInterfaceService {
  private base = "smartchartui"
  patientEndpoint: string = `${this.base}/patient`;
  groupEndpoint: string = `${this.base}/group`;
  questionnaireEndpoint: string = `${this.base}/questionnaire`;
  startJobsEndpoint: string = `forms/start?asyncFlag=True`;
  getJobPackageEndpoint: string = `forms`;
  getBatchJobsEndpoint: string = `${this.base}/batchjob`

  constructor(private configService: ConfigService,
              private http: HttpClient) {
  }

  /**
   * Request a specific Patient resource from the EHR from RC API by their FHIR ID. FHIR pass through for SmartChart UI.
   * @param id - The patient's FHIR ID.
   */
  readPatient(id: string): Observable<FhirBaseResource> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.patientEndpoint}/${id}`);
  }

  /**
   * Search all Patient resources. FHIR pass through for SmartChart UI.
   * TODO: Implement search (in addition to read) endpoint that can handle parameters in the API
   * TODO: TABLED FOR LATER
   */
  searchPatient(searchParameters?: PatientSearchParameters): Observable<PatientSummary[]> {
    const searchPatientUrl = this.configService.config.rcApiUrl + `${this.patientEndpoint}`;
    let patientSearch$ = new Observable();
    if (!searchParameters) {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl);
    }
    else {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl, {params: searchParameters})
    }

    return patientSearch$.pipe(
      map((value: any) => {
        const entries = value["entry"];
        let patientSummaryList: PatientSummary[] = [];
        // TODO Map entries to Patient Summaries and add to list.
        return patientSummaryList;
      })
    )
  }

  /**
   * Search all Group resources. FHIR pass through for SmartChart UI.
   */
  searchGroup(): Observable<any> {
    const groups$ = this.http.get<any[]>(this.configService.config.rcApiUrl + `${this.groupEndpoint}`).pipe(
      map(groupList => {
        groupList.forEach(value => {
          console.log(value)
          value.member.forEach((member: any) => console.log(member.entity.reference))
          // TODO: Implement in API to make one clean call from UI
        })

        return [{
          "groupName": "Group 1",
          "patients": [
            {} // PATIENT SUMMARY OBJECT
          ]
        }]
      })
    );

    const mockData: PatientGroup[] = [{
      "groupName": "Group 1",
      "members": [
        {fhirId: "1", name: {given: ["Bob"], family: "Smith"}, birthDate: new Date("1960-07-12"), gender: "male"}, // PATIENT SUMMARY OBJECT
        {fhirId: "2", name: {given: ["Sarah"], family: "Cubin"}, birthDate: new Date("1989-02-14"), gender: "female"} // PATIENT SUMMARY OBJECT
      ]},
      {
        "groupName": "Group 2",
        "members": [
          {fhirId: "3", name: {given: ["Jeremy"], family: "Sanders"}, birthDate: new Date("2015-12-30"), gender: "male"}, // PATIENT SUMMARY OBJECT
        ]}
    ]
    const groupsMock$ = of(mockData)
    return groups$.pipe();
  }

  /**
   * Search SmartChart UI Questionnaire Resources. FHIR pass through for SmartChart UI. Returns a list of FormSummary objects. To get a full form/questionnaire, see getJobPackage.
   */
  getSmartChartUiQuestionnaires(): Observable<FormSummary[]> {
    return this.http.get<FhirBaseResource[]>(this.configService.config.rcApiUrl + `${this.questionnaireEndpoint}`).pipe(
      map(resultsList => {
        let formSummaryList: FormSummary[] = []
        formSummaryList = resultsList.map(questionnaireResource=> new FormSummary(questionnaireResource));
        return formSummaryList;
      })
    );
  }

  /**
   * Get a JobPackage questionnaire by the name of the Job Package using the standard RC API Endpoint.
   */
  getJobPackage(jobPackage: string) {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}/${jobPackage}`);
  }

  /**
   * Start Jobs Async
   * jobPackage = "name" in the FHIR Questionnaire
   */
  startJobs(patientId: string, jobPackage: string): Observable<StartJobsPostResponse> {
    const postBody = new StartJobsPostBody(patientId, jobPackage)
    return this.http.post<StartJobsPostResponse>(this.configService.config.rcApiUrl + this.startJobsEndpoint, postBody);
  }

  /**
   * This will return all Batch Jobs, which is functionally the list of "active" (completed, in progress, and otherwise terminated) cases.
   * This is returned as a flat list of FHIR Parameter JSON objects.
   */
  getBatchJobs() {
    const batchJobs$ = this.http.get<Parameters[]>(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + "?include_patient=True").pipe(
      map((response: Parameters[]) => {
        let activeJobList: ActiveFormSummary[] = [];
        response.forEach(parametersResource => {
          // TODO: Fetch Patient, need to setup as merge map? What is the right approach here? @Plamen
          activeJobList.push(new ActiveFormSummary(parametersResource));
        });
        return activeJobList;
      })
    )
    return batchJobs$;
  }

  getBatchJob(id: string) {
    return this.http.get(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + `/${id}?include_patient=True`)
  }
}
