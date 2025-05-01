import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-create-group-dialog',
  standalone: false,
  templateUrl: './create-group-dialog.component.html',
  styleUrl: './create-group-dialog.component.scss'
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
