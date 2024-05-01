import {Directive, HostListener, Input} from '@angular/core';
import {FhirBaseResource} from "../models/fhir/fhir.base.resource";
import {EvidenceViewerService} from "../services/evidence-viewer.service";

@Directive({
  selector: '[appSetEvidence]',
  standalone: true
})
export class SetEvidenceDirective {

  @Input() evidenceList: FhirBaseResource[]

  constructor(private evidenceViewerService: EvidenceViewerService) { }

  @HostListener('click', ['$event']) onClick(event: any) {
    if (this.evidenceList) {
      this.evidenceViewerService.setEvidence(this.evidenceList);
    }
  }

}
