import { Pipe, PipeTransform } from '@angular/core';
import {UtilsService} from "../services/utils/utils.service";
import {DatePipe} from "@angular/common";
@Pipe({
  name: 'concatDataToStr',
  standalone: true
})
export class ConcatDataToStrPipe implements PipeTransform {

  constructor(private utilsService: UtilsService){}

  transform(data: any): string {
    if(!data){
      return "";
    }
    return Object.entries(data).map(entry=> `${this.camelCaseToTitleCase(entry[0])}: ${this.getEntryStrValue(entry[1])}`).join('\n');
  }

  getEntryStrValue(value){
    if(!value){
      return "";
    }
    if(this.utilsService.isValidDate(value)){
      return this.getFormattedDate(value);
    }
    return value;
  }

  getFormattedDate(dateStr) {
    let datePipe = new DatePipe("en-US");
    return datePipe.transform(dateStr, 'MM/dd/yyyy');
  }

  camelCaseToTitleCase(camelCaseStr) {
    return camelCaseStr
      // Insert a space before all capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize the first letter of the string
      .replace(/^./, function(str) { return str.toUpperCase(); });
  }

}
