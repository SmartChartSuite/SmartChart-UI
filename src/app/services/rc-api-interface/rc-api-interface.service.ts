import { Injectable } from '@angular/core';
import {ConfigService} from "../config/config.service";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class RcApiInterfaceService {
  readPatientEndpoint: string = "smartchartsuite/patient";

  constructor(private configService: ConfigService,
              private http: HttpClient) {

  }

  /**
   * Request a specific patient from the Electronic Health Record from RC API by their FHIR ID.
   * @param id - The patient's FHIR ID.
   */
  readPatient(id: string): Observable<any> {
    return this.http.get(this.configService.config.rcApiUrl + `${this.readPatientEndpoint}/${id}`)
  }

  searchGroup() {

  }

  searchQuestionnaire() {

  }
}
