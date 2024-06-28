import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ResultSet} from "../../models/results";

@Injectable({
  providedIn: 'root'
})
export class EvidenceViewerService {

  private resultSet: BehaviorSubject<ResultSet> = new BehaviorSubject<ResultSet>(new ResultSet())
  resultSet$ = this.resultSet.asObservable();

  private viewerExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  viewerExpanded$ = this.viewerExpanded.asObservable();

  constructor() { }

  setEvidence(resultSet: ResultSet) {
    this.resultSet.next(resultSet);
  }

  setViewerExpanded(expanded: boolean){
    this.viewerExpanded.next(expanded);
  }
}
