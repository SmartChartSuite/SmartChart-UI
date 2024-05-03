import {Directive, HostListener, Input} from '@angular/core';
import {FhirBaseResource} from "../models/fhir/fhir.base.resource";
import {EvidenceViewerService} from "../services/evidence-viewer.service";
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
