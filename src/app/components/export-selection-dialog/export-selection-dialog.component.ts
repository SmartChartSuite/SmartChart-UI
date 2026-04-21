import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogTitle, MatDialogContent } from "@angular/material/dialog";
import { MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-export-selection-dialog',
    templateUrl: './export-selection-dialog.component.html',
    styleUrl: './export-selection-dialog.component.scss',
    imports: [
      MatCardTitle,
      MatDialogTitle,
      MatDialogContent,
      FormsModule,
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatSelect,
      MatOption,
      MatButton,
      MatIcon
    ]
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
