import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate',
  standalone: true
})

export class SortByDatePipe implements PipeTransform {
  transform(data: any, key: string, direction: 'asc'| 'desc'): any {
    if(!data || !key || !direction){
      return data; //All Arguments are required for the pipe to work
    }
    if(direction == 'asc'){
      return data.sort((a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime());
    }
    if(direction == 'desc'){
      return data.sort((a, b) => new Date(b[key]).getTime() - new Date(a[key]).getTime());
    }
  }

}
