import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {openDocumentViewerModal} from "../document-viewer-modal/document-viewer-modal.component";
import {EvidenceViewerService} from "../../../services/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnInit {

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];

  constructor(private dialog: MatDialog, private evidenceViewerService: EvidenceViewerService) {
  }
  ngOnInit(): void {
    this.evidenceViewerService.evidenceList$.subscribe({
      next: (evidenceList: FhirBaseResource[]) => {
        console.log(evidenceList);
        const [cqlResources, nlpResources] = evidenceList.reduce(([cqlResources, nlpResources], resource) => {
          (resource.resourceType === "DocumentReference" ? nlpResources : cqlResources).push(resource);
          return [cqlResources, nlpResources];
        }, [[], []]);
        this.cqlResources = cqlResources;
        this.nlpResources = nlpResources;

        console.log(this.cqlResources);
        console.log(this.nlpResources);
      }
    })
  }
  onExpandDocument() {
    openDocumentViewerModal(
      this.dialog,
      {
        title: "Title",
        content: "Sample Content",
        size: {
          minWidth: "500px",
          minHeight: "300px"
        }
      })
      .subscribe();
  }


}
