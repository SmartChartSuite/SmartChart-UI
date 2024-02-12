import { Injectable } from '@angular/core';
import {ConfigService} from "../config/config.service";
import {Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {FhirBaseResource} from "../../models/rc-api/fhir.base.resource";
import {StartJobsPostBody} from "../../models/rc-api/start-jobs-post-body";
import {StartJobsPostResponse} from "../../models/rc-api/start-jobs-post-response";

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
   * TODO: Implement Parameters.
   */
  searchPatient(): Observable<FhirBaseResource> {
    // TODO: Handle FHIR Params
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.patientEndpoint}`);
  }

  /**
   * Search all Group resources. FHIR pass through for SmartChart UI.
   */
  searchGroup(): Observable<FhirBaseResource> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.groupEndpoint}`);
  }

  /**
   * Search all Questionnaire Resources. FHIR pass through for SmartChart UI.
   */
  searchQuestionnaire(): Observable<FhirBaseResource> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.questionnaireEndpoint}`);
  }

  /**
   * Get a JobPackage questionnaire by the name of the Job Package using the standard RC API Endpoint.
   */
  getJobPackage(jobPackage: string) {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}/${jobPackage}`);
  }

  /**
   * Start Jobs Async
   */
  startJobs(patientId: string, jobPackage: string, jobName: string): Observable<StartJobsPostResponse> {
    const postBody = new StartJobsPostBody(patientId, jobPackage, jobName)
    return this.http.post<StartJobsPostResponse>(this.configService.config.rcApiUrl + this.startJobsEndpoint, postBody);
  }
}
