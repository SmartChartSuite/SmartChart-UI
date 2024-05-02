import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {openDocumentViewerModal} from "../document-viewer-modal/document-viewer-modal.component";
import {EvidenceViewerService} from "../../../services/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {NlpAnswer, ResultSet} from "../../../models/results";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnInit {

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];
  nlpAnswers: NlpAnswer[];

  constructor(private dialog: MatDialog, private evidenceViewerService: EvidenceViewerService) {
  }
  ngOnInit(): void {
    this.evidenceViewerService.resultSet$.subscribe({
      next: (resultSet: ResultSet) => {
        const evidenceList = resultSet.evidence;
        const [cqlResources, nlpResources] = evidenceList.reduce(([cqlResources, nlpResources], resource) => {
          (resource.resourceType === "DocumentReference" ? nlpResources : cqlResources).push(resource);
          return [cqlResources, nlpResources];
        }, [[], []]);
        this.cqlResources = cqlResources;
        this.nlpResources = nlpResources;
        this.nlpAnswers = resultSet.nlpAnswers;

        console.log(this.cqlResources);
        console.log(this.nlpResources);
        console.log(this.nlpAnswers);
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
