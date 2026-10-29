import { Injectable } from '@angular/core';
import { Bundle } from '../../models/fhir/fhir.bundle.resource';
import { PatientGrid } from '../../models/patient-grid';

export interface PatientData {
  total: number;
  patients: PatientGrid[];
}

@Injectable({
  providedIn: 'root',
})
export class JobsFormsHelperService {

  /**
   * Helper to extract the value from the complex FHIR parameter structure
   */
  flattenFhirParameters(parameters: any[] = []): Record<string, any> {
    return parameters.reduce((acc, param) => {
      let value = param.valueString ?? param.valueCode ?? param.valueDate ??
                  param.valueDateTime ?? param.valueInteger ?? param.resource ??
                  param.valueReference?.reference ?? param.valueReference;

      // Special handling for batchJobQuestionnaireResponse - extract ID and rename
      if (param.name === 'batchJobQuestionnaireResponse' && typeof value === 'string') {
        // Extract ID from "QuestionnaireResponse/3670aead-8b33-4ce6-90a4-fc2150dd0593"
        const parts = value.split('/');
        acc['questionnaireResponseId'] = parts.length > 1 ? parts[1] : value;
      } else if (param.name) {
        acc[param.name] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /** Maps the known batch-job Parameters fields into the strict list-row model. */
  toPatientGrid(parameters: any[] = []): PatientGrid {
    const values = this.flattenFhirParameters(parameters);
    return {
      batchId: values['batchId'],
      patientId: values['patientId'],
      jobPackage: values['jobPackage'],
      jobPackageTitle: values['jobPackageTitle'],
      questionnaireId: values['questionnaireId'],
      startedBy: values['startedBy'],
      batchJobStatus: values['batchJobStatus'],
      batchJobProgress: values['batchJobProgress'],
      jobStartDateTime: values['jobStartDateTime'],
      jobCompletedDateTime: values['jobCompletedDateTime'],
      questionnaireResponseStatus: values['questionnaireResponseStatus'],
      responseLastUpdated: values['responseLastUpdated'],
      questionnaireResponseId: values['questionnaireResponseId'],
      patientName: values['patientName'],
      patientDob: values['patientDob'],
      patientGender: values['patientGender']
    };
  }

  /**
   * Converts a FHIR Bundle response to PatientData structure
   */
  toPatientData(bundle: Bundle): PatientData {
    const patients: PatientGrid[] = (bundle.entry || []).map(entry => {
      const paramArray = entry.resource['parameter'] || [];
      return this.toPatientGrid(paramArray);
    });

    return {
      total: bundle.total || 0,
      patients
    };
  }
}
