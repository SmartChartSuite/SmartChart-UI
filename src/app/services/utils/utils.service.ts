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

  isValidDate(dataString: string): boolean {
    if(!dataString){
      return false;
    }
    // The app only uses dates of format yyyy-mm-dd, all other dates are not valid
    const dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
    const validDateRegex = dateRegex.test(dataString);

    // The first step is to validate that the date is in the format yyyy-mm-dd using a regex
    if(validDateRegex){
      return true;
    }

    // The second step is make sure that the data contains enough chars
    if(dataString.length < 10){
      return false;
    }

    // The third step is to validate that the date is valid
    const parsedDate = Date.parse(dataString);
    return !!parsedDate;
  }
}
