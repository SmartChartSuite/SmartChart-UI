import { Component } from '@angular/core';
import {openModal} from "../../widgets/modal/modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent {
  constructor(private dialog: MatDialog,) {
  }

  onExpandDocument() {
    openModal(
      this.dialog,
      {
        title: "Title",
        content: "Sample Content",
        contentType: 'text',
        size: {
          minWidth: "500px",
          minHeight: "300px"
        }
      })
      .subscribe();
  }
}
