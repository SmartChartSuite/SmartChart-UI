import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FhirBaseResource} from "../models/fhir/fhir.base.resource";

@Injectable({
  providedIn: 'root'
})
export class EvidenceViewerService {

  private evidenceList: BehaviorSubject<FhirBaseResource[]> = new BehaviorSubject<FhirBaseResource[]>([])
  evidenceList$ = this.evidenceList.asObservable();

  constructor() { }

  setEvidence(evidenceList: FhirBaseResource[]) {
    this.evidenceList.next(evidenceList);
  }
}
