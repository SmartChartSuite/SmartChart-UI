import {Directive, HostListener, Input} from '@angular/core';
import {EvidenceViewerService} from "../services/evidence-viewer/evidence-viewer.service";
import {ResultSet} from "../models/results";

@Directive({
  selector: '[appSetEvidence]',
  standalone: true
})
export class SetEvidenceDirective {

  @Input() resultSet: ResultSet;

  constructor(private evidenceViewerService: EvidenceViewerService) { }

  @HostListener('click', ['$event']) onClick(event: any) {
    if (this.resultSet) {
      this.evidenceViewerService.setEvidence(this.resultSet);
    }
  }

}
