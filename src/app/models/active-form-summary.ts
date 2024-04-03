import {PatientSummary} from "./patient-summary";
import {Parameters} from "./rc-api/fhir.parameters.resource";
import {FhirBaseResource} from "./rc-api/fhir.base.resource";

export class ActiveFormSummary {
  constructor(parametersResource: Parameters) {
    parametersResource.parameter.forEach(param => {
      if (param["name"] === "patientResource") {
        const patientResource: FhirBaseResource = Parameters.getValue(parametersResource, "patientResource") as FhirBaseResource;
        this.patientSummary = new PatientSummary(patientResource);
      }
    })
    this.formName = Parameters.getValue(parametersResource, "jobPackage") as string;
    this.started = Parameters.getValue(parametersResource, "jobStartDateTime") as string;
  }

  patientSummary: PatientSummary;
  formName: string; // Equivalent to JobPackage in the Parameters.
  started: string; // TODO: Parse to DateTime

}
