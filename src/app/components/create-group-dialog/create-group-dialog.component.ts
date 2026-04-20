import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogContent } from "@angular/material/dialog";
import { MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-create-group-dialog',
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.scss',
    imports: [
      MatCardTitle,
      MatDialogContent,
      FormsModule,
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatInput,
      MatError,
      MatButton,
      MatIcon
    ]
})
export class CreateGroupDialogComponent {

  constructor(private dialogRef: MatDialogRef<any>) { }

  formGroup = new FormGroup({
    groupName: new FormControl(null, Validators.required),
  });

  onSubmit() {
    this.dialogRef.close();
  }

  onCancel() {
    this.formGroup.reset();
    this.dialogRef.close();
  }
}


export function openCreateGroupDialog(dialog: MatDialog, dialogData: any) {
  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.width = dialogData.width ?? "30em";
  config.height = dialogData.height ?? "16em";

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(CreateGroupDialogComponent, config);

  return dialogRef.afterClosed();
}
