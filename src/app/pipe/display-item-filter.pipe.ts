import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayItemFilter',
  standalone: true
})
export class DisplayItemFilterPipe implements PipeTransform {

  transform(data: any): any {
    return data.filter(item => item['type'] !== 'display')
  }

}
