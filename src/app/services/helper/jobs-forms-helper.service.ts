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
      const value = param.valueString ?? param.valueCode ?? param.valueDate ??
                    param.valueDateTime ?? param.valueInteger ?? param.resource;

      if (param.name) {
        acc[param.name] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Converts a FHIR Bundle response to PatientData structure
   */
  toPatientData(bundle: Bundle): PatientData {
    const patients: PatientGrid[] = (bundle.entry || []).map(entry => {
      const paramArray = entry.resource['parameter'] || [];
      return this.flattenFhirParameters(paramArray) as PatientGrid;
    });

    return {
      total: bundle.total || 0,
      patients
    };
  }
}
