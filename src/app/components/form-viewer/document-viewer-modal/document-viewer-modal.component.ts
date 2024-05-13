import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {SafeHtml} from "@angular/platform-browser";


@Component({
  selector: 'app-document-viewer-modal',
  templateUrl: './document-viewer-modal.component.html',
  styleUrl: './document-viewer-modal.component.scss'
})
export class DocumentViewerModalComponent implements OnInit{

  content: any; // The content of the modal (the modal should render html)
  title: string = null; // The title of the modal
  htmlContent: SafeHtml;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) { }

  ngOnInit(): void {
    this.content = this.dialogData.content;
    this.title = this.dialogData.title;
    this.htmlContent = this.dialogData.htmlContent
  }
}

export function openDocumentViewerModal(dialog: MatDialog, dialogData: any) {

  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.data = {
    ...dialogData,
  }
  config.minWidth = dialogData.size?.minWidth;
  config.minHeight = dialogData.size?.minHeight;

  const dialogRef = dialog.open(DocumentViewerModalComponent, config);

  return dialogRef.afterClosed();
}
