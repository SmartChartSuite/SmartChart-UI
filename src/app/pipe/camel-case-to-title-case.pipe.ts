import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCaseToTitleCase',
  standalone: true
})
export class CamelCaseToTitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Replace each capital letter with a space followed by the capital letter
    // Then capitalize the first letter of the resulting string
    return value.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (match) => match.toUpperCase());
  }
}
