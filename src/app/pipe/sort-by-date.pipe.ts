import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate',
  standalone: true
})

export class SortByDatePipe implements PipeTransform {
  private getValueByKeys(obj: any, keys: string[]): any {
    return keys.reduce((value, key) => (value && value[key] !== undefined) ? value[key] : undefined, obj);
  }

  transform(data: any, key: string | string[], direction: 'asc'| 'desc'): any {
    if(!data || !key || !direction){
      return data;
    }
    const keys = Array.isArray(key) ? key : [key];
      return data.sort((a, b) => {
        const aValue = new Date(this.getValueByKeys(a, keys)).getTime();
        const bValue = new Date (this.getValueByKeys(b, keys)).getTime();
        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        } else if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      })
    }
}
