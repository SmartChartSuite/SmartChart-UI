import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {openDocumentViewerModal} from "../document-viewer-modal/document-viewer-modal.component";
import {EvidenceViewerService} from "../../../services/evidence-viewer.service";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnInit {
  constructor(private dialog: MatDialog, private evidenceViewerService: EvidenceViewerService) {
  }
  ngOnInit(): void {
    this.evidenceViewerService.evidenceList$.subscribe({
      next: value => {console.log(value)}
    })
  }
  onExpandDocument() {
    openDocumentViewerModal(
      this.dialog,
      {
        title: "Document Content",
        content: "Sample Content",
        size: {
          minWidth: "500px",
          minHeight: "300px"
        }
      })
      .subscribe();
  }


}
