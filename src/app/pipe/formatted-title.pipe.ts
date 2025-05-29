import { Pipe, PipeTransform } from '@angular/core';
import { Results } from '../models/results';

@Pipe({
  name: 'formattedTitle'
})
export class FormattedTitlePipe implements PipeTransform {

  transform(value: any, results: Results): string {
    const questionCount = this.getQuestionCount(value);
    const evidenceCount = this.getEvidenceCount(value, results);
    return `${value["text"]} (${evidenceCount}/${questionCount})`
  }

  private getEvidenceCount(value: any, results): number {
    if(!value.item?.length){
      return 0;
    }
    return value.item.filter(element => this.hasEvidence(element, results))?.length || 0;
  }

  private hasEvidence(element, results) {
    if(!(element.extension?.length > 0)){
      return false;
    }
    const hasExtension: boolean =  element?.extension?.some(ext =>
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/cqlTask") ||
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/nlpqlTask"))
    const hasAnswer = results?.[`link${element.linkId}`]
    return hasExtension && hasAnswer;

  }

  private getQuestionCount(value: any) {
    if(!value || !value.item?.length){
      return 0;
    }
    let questionCount = 0;
    questionCount = value?.item.filter(element => element?.type !='display')?.length || 0;
    return questionCount;
  }
}
