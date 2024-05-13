import {Component, Input} from '@angular/core';
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {NlpAnswer} from "../../../../models/results";

@Component({
  selector: 'app-unstructured-results-details',
  templateUrl: './unstructured-results-details.component.html',
  styleUrl: './unstructured-results-details.component.scss'
})
export class UnstructuredResultsDetailsComponent {
  @Input() nlpAnswer: NlpAnswer;
  constructor(private dialog: MatDialog){}

  onExpandDocument() {
    openDocumentViewerModal(
      this.dialog,
      {
        title: "Document Content",
        content: this.nlpAnswer.fullText,
        size: {
          minWidth: "500px",
          minHeight: "300px"
        }
      })
      .subscribe();
  }

}
