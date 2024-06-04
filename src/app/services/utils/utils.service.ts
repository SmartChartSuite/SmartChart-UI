import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private _snackBar: MatSnackBar) { }
  //TODO add styling for app-notification-success and app-notification-error
  showSuccessMessage(messageStr: string){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-success'],
      duration: 3000
    });
  }

  showErrorMessage(messageStr: string = 'Server error'){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-error'],
      duration: 3000
    });
  }
}
