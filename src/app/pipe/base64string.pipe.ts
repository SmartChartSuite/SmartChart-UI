import { Pipe, PipeTransform } from '@angular/core';
// TODO delete if not used
@Pipe({
  name: 'base64string',
  standalone: true
})
export class Base64stringPipe implements PipeTransform {

  transform(base64string: string): string {
    return atob(base64string)
  }

}
