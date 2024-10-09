import {PatientSummary} from "./patient-summary";
import {Parameters} from "./fhir/fhir.parameters.resource";
import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class ActiveFormSummary {
  constructor(parametersResource: Parameters) {
    parametersResource.parameter.forEach(param => {
      if (param["name"] === "patientResource") {
        const patientResource: FhirBaseResource = Parameters.getValue(parametersResource, "patientResource") as FhirBaseResource;
        this.patientSummary = new PatientSummary(patientResource);
      }
    })
    this.batchId = Parameters.getValue(parametersResource, "batchId") as string;
    this.formName = Parameters.getValue(parametersResource, "jobPackage") as string;
    this.started = Parameters.getValue(parametersResource, "jobStartDateTime") as string;
    this.status = Parameters.getValue(parametersResource, "batchJobStatus") as string;
  }

  batchId: string;
  patientSummary: PatientSummary;
  formName: string; // Equivalent to JobPackage in the Parameters.
  started: string; // TODO: Parse to DateTime
  status: string;

}
