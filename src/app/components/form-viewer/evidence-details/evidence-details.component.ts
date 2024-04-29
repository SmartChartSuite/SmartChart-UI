import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {openDocumentViewerModal} from "../document-viewer-modal/document-viewer-modal.component";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent {
  constructor(private dialog: MatDialog,) {
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
