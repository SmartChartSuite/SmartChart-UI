import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

export interface DialogData {
  title?: string;
  content?: string;
  primaryActionBtnTitle?: string; // Is the action we want to take. For example Save, Delete
  secondaryActionBtnTitle?: string; // Permits the user to exist without executing the primary action. For example Cancel
  isPrimaryButtonLeft?: boolean; // Indicates the position of the primary action. If the primary action is on the left, the default button is the secondary action.
  width?: string;
  height?: string;
  isSecondaryActionDanger?: boolean;
}

@Component({
  selector: 'app-confirmation-modal',
  imports: [
    MatDialogModule,
    MatButton,
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})

export class ConfirmationDialog {
  private dialogRef = inject(MatDialogRef<any>);
  private dialogData = inject<DialogData>(MAT_DIALOG_DATA);

  data: DialogData = {
    title: this.dialogData.title ?? "",
    content: this.dialogData.content ?? "Do you want to continue?",
    primaryActionBtnTitle: this.dialogData.primaryActionBtnTitle ?? "Yes",
    secondaryActionBtnTitle: this.dialogData.secondaryActionBtnTitle ?? "No",
    width: this.dialogData.width ?? '4em',
    height: this.dialogData.height ?? '4em',
    isPrimaryButtonLeft: this.dialogData.isPrimaryButtonLeft ?? false,
    isSecondaryActionDanger: this.dialogData.isSecondaryActionDanger ?? false
  };

  onSecondaryClick(): void {
    this.dialogRef.close('secondaryAction');
  }

  onDefaultClick(): void {
    this.dialogRef.close('primaryAction');
  }
}

export function openConfirmationDialog(dialog: MatDialog, dialogData?: DialogData) {

  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.width = dialogData?.width
  config.height = dialogData?.height;

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(ConfirmationDialog, config);

  return dialogRef.afterClosed();
}

