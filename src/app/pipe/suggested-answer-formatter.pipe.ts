import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suggestedAnswer',
  standalone: true
})
export class SuggestedAnswerFormatterPipe implements PipeTransform {
  transform(value: string): string[] {
    const result =   this.toArray(value.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (match) => match.toUpperCase()));
    return  result;
  }

  private toArray(value: string): string[] {
     const result = value.replace(/^\[|\]$/g, '') // Remove the opening and closing brackets
      .split(',')
      .map(item => item.trim())
     return result;
  }

}
