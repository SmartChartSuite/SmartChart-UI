import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suggestedAnswer',
  standalone: true
})
export class SuggestedAnswerFormatterPipe implements PipeTransform {
  transform(value: string): string[] {
    const result = value.replace(/^\[|\]$/g, '') // Remove the opening and closing brackets
      .split(',')
      .map(item => item.trim())
    return result;
  }
}
