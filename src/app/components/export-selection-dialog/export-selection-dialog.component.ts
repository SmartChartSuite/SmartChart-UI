import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-export-selection-dialog',
  templateUrl: './export-selection-dialog.component.html',
  styleUrl: './export-selection-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatDialogActions,
  ]
})
export class ExportSelectionDialogComponent {
  exportTypes: string[] = ['json', 'pdf']

  exportForm = new FormGroup({
    exportType: new FormControl(this.exportTypes[0])
  });

  constructor(private dialogRef: MatDialogRef<any>) {
  }

  onExport(value): void {
    this.dialogRef.close(value.exportType);
  }

  onCancel() {
    this.dialogRef.close();
  }
}


export function openExportFileDialog(dialog: MatDialog, dialogData: any) {
  const config = new MatDialogConfig();

  config.autoFocus = true;

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(ExportSelectionDialogComponent, config);

  return dialogRef.afterClosed();
}
