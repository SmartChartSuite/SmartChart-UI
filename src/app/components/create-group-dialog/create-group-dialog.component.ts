import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {MatDialog, MatDialogConfig, MatDialogRef, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import { MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";

@Component({
    selector: 'app-create-group-dialog',
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCardTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
  ]
})
export class CreateGroupDialogComponent {

  constructor(private dialogRef: MatDialogRef<any>) { }

  formGroup = new FormGroup({
    groupName: new FormControl(null, Validators.required),
  });

  onSubmit() {
    if(this.formGroup.valid) {}
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
