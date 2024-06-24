import { Pipe, PipeTransform } from '@angular/core';
import {UtilsService} from "../services/utils/utils.service";

@Pipe({
  name: 'isValidDate',
  standalone: true
})
export class IsValidDatePipe implements PipeTransform {
  constructor(private utilsService: UtilsService){}
  transform(data : any): boolean {
    return this.utilsService.isValidDate(data);
  }
}
