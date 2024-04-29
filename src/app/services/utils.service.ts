import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private _snackBar: MatSnackBar) { }
  showSuccessMessage(messageStr: string){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-success'],
      duration: 3000
    });
  }
}
