import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-export-selection-dialog',
  standalone: false,
  templateUrl: './export-selection-dialog.component.html',
  styleUrl: './export-selection-dialog.component.scss'
})
export class ExportSelectionDialogComponent {
  exportTypes: string[] = ['json', 'pdf']

  exportForm = new FormGroup({
    exportType: new FormControl(this.exportTypes[0])
  });

  constructor(private dialogRef: MatDialogRef<any>) { }

  onExport(value): void {
    console.log(value);
    this.dialogRef.close();
  }
}


export function openExportFileDialog(dialog: MatDialog, dialogData: any) {
  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.width = dialogData.width ?? "28em";
  config.height = dialogData.height ?? "12em";

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(ExportSelectionDialogComponent, config);

  return dialogRef.afterClosed();
}
