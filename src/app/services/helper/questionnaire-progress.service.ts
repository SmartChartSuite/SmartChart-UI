import {Injectable} from '@angular/core';
import {Item, Questionnaire} from '../../models/fhir/resources/fhir.questionnaire';
import {QuestionnaireResponse, QuestionnaireResponseItem} from '../../models/fhir/resources/fhir.questionnaireresponse';
import {QuestionnaireItemType} from '../../models/fhir/valuesets/questionnaire-item-type';

export interface QuestionnaireProgress {
  answered: number;
  total: number;
  percent: number;
}

/** Returns whether the question with the given linkId has an answer. */
export type AnswerLookup = (linkId: string) => boolean;

/**
 * Shared completion math for a Questionnaire. Sections are the top-level items;
 * questions are their non-display children.
 */
@Injectable({providedIn: 'root'})
export class QuestionnaireProgressService {
  countQuestions(section: Item | undefined): number {
    return (section?.item ?? []).filter(question => question.type !== QuestionnaireItemType.display).length;
  }

  countAnswered(section: Item | undefined, isAnswered: AnswerLookup): number {
    return (section?.item ?? []).filter(question =>
      question.type !== QuestionnaireItemType.display && isAnswered(question.linkId)
    ).length;
  }

  getProgress(questionnaire: Questionnaire | undefined, isAnswered: AnswerLookup): QuestionnaireProgress {
    const sections = questionnaire?.item ?? [];
    const total = sections.reduce((sum, section) => sum + this.countQuestions(section), 0);
    const answered = sections.reduce((sum, section) => sum + this.countAnswered(section, isAnswered), 0);
    return {answered, total, percent: total > 0 ? (answered / total) * 100 : 0};
  }

  /** Whether a stored answer value counts as answered. */
  hasAnswerValue(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    return !Array.isArray(value) || value.length > 0;
  }

  /** Builds an answer lookup from a saved QuestionnaireResponse. */
  answerLookupFromResponse(questionnaireResponse: QuestionnaireResponse | undefined): AnswerLookup {
    const answered = new Set<string>();
    const collect = (items: QuestionnaireResponseItem[] | undefined): void => {
      (items ?? []).forEach(item => {
        if (this.hasAnswerValue(this.firstAnswerValue(item))) {
          answered.add(item.linkId);
        }
        collect(item.item);
      });
    };
    collect(questionnaireResponse?.item);
    return linkId => answered.has(linkId);
  }

  /** Reads the value[x] of the first answer, whatever its type. */
  private firstAnswerValue(item: QuestionnaireResponseItem): unknown {
    const answer = item.answer?.[0] as Record<string, unknown> | undefined;
    if (!answer) {
      return undefined;
    }
    const valueKey = Object.keys(answer).find(key => key.startsWith('value'));
    return valueKey ? answer[valueKey] : undefined;
  }
}
