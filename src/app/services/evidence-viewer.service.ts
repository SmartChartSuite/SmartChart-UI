import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FhirBaseResource} from "../models/fhir/fhir.base.resource";
import {ResultSet} from "../models/results";

@Injectable({
  providedIn: 'root'
})
export class EvidenceViewerService {

  private resultSet: BehaviorSubject<ResultSet> = new BehaviorSubject<ResultSet>(new ResultSet())
  resultSet$ = this.resultSet.asObservable();

  constructor() { }

  setEvidence(resultSet: ResultSet) {
    this.resultSet.next(resultSet);
  }
}
