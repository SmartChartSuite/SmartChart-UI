import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64string',
  standalone: true
})
export class Base64stringPipe implements PipeTransform {

  transform(base64string: string): string {
    return atob(base64string)
  }

}
