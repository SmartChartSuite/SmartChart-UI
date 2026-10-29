import {inject, Injectable} from '@angular/core';
import {Questionnaire} from '../../models/fhir/resources/fhir.questionnaire';
import {QuestionnaireResponse} from '../../models/fhir/resources/fhir.questionnaireresponse';
import {FhirBaseResource} from '../../models/fhir/fhir.base.resource';
import {FormDetails} from '../../models/form-details';
import {PatientSummary} from '../../models/patient-summary';
import {RcApiConfig} from '../../models/rc-api/rc-api-config';
import {QuestionnaireProgressService} from './questionnaire-progress.service';

@Injectable({providedIn: 'root'})
export class FormDetailsHelperService {
  private readonly questionnaireProgress = inject(QuestionnaireProgressService);

  toFormDetails(
    batchId: string,
    questionnaire: Questionnaire | undefined,
    questionnaireResponse: QuestionnaireResponse | undefined,
    patient: FhirBaseResource | undefined,
    config: RcApiConfig | undefined
  ): FormDetails {
    const patientSummary = patient ? new PatientSummary(patient) : undefined;
    const identifierSystem = config?.primaryIdentifier?.system;
    const patientName = [patientSummary?.name?.given, patientSummary?.name?.family]
      .filter(Boolean)
      .join(' ');

    const progress = this.questionnaireProgress.getProgress(
      questionnaire,
      this.questionnaireProgress.answerLookupFromResponse(questionnaireResponse)
    );

    const details: FormDetails = {
      batchId,
      questionnaireTitle: questionnaire?.title,
      questionnaireName: questionnaire?.['name'],
      questionnaireStatus: questionnaire?.['status'],
      questionnaireVersion: questionnaire?.['version'],
      questionnaireDescription: questionnaire?.['description'],
      responseStatus: questionnaireResponse?.status,
      responseLastUpdated: questionnaireResponse?.['meta']?.['lastUpdated'],
      responseLastModifiedBy: questionnaireResponse?.author?.display,
      responseAnsweredCount: progress.answered,
      responseQuestionCount: progress.total,
      responseCompletionPercent: progress.percent,
      patientName: patientName || undefined,
      // FHIR birthDate is a date string; PatientSummary types it as Date, so read it from the resource.
      patientBirthDate: patient?.['birthDate'],
      patientGender: patientSummary?.gender,
      // Only show an identifier when the environment configures which system to use.
      patientIdentifierLabel: identifierSystem
        ? (config?.primaryIdentifier?.label ?? 'Medical Record Number')
        : undefined,
      patientIdentifierValue: identifierSystem
        ? patientSummary?.identifier?.find(identifier => identifier.system === identifierSystem)?.value
        : undefined
    };

    console.log('[FormDetails]', details);
    return details;
  }
}
