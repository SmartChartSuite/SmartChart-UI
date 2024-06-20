import { Pipe, PipeTransform } from '@angular/core';
// TODO delete if not used
@Pipe({
  name: 'concatDataToStr',
  standalone: true
})
export class ConcatDataToStrPipe implements PipeTransform {

  transform(data: any): string {
    if(!data){
      return "";
    }
    const result = Object.entries(data).map(entry=> `${this.camelCaseToTitleCase(entry[0])}: ${entry[1]}`).join('\n');
    console.log(result);
    return result;
  }

  camelCaseToTitleCase(camelCaseStr) {
    return camelCaseStr
      // Insert a space before all capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize the first letter of the string
      .replace(/^./, function(str) { return str.toUpperCase(); });
  }

}
