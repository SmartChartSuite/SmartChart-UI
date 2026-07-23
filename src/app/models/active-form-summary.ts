import {PatientSummary} from "./patient-summary";
import {Parameters} from "./fhir/fhir.parameters.resource";
import {FhirBaseResource} from "./fhir/fhir.base.resource";
import {PatientGrid} from "./patient-grid";

export class ActiveFormSummary {
  // Constructor overload signatures
  constructor(parametersResource: Parameters);
  constructor(patientResource: FhirBaseResource, patientGridDto: PatientGrid);
  // TODO refactor this, we only need one constructor
  // Constructor implementation
  constructor(
    parametersOrPatientResource: Parameters | FhirBaseResource,
    patientGridDto?: PatientGrid
  ) {
    // Type guard: Check if second parameter is provided (second constructor pattern)
    if (patientGridDto !== undefined) {
      // Second constructor: (patientResource, patientGridDto)
      this.patientSummary = new PatientSummary(parametersOrPatientResource as FhirBaseResource);
      this.batchId = patientGridDto.batchId;
      this.formName = '';
      this.started = '';
      this.status = '';
    } else {
      // First constructor: (parametersResource)
      const parametersResource = parametersOrPatientResource as Parameters;
      parametersResource.parameter.forEach(param => {
        if (param["name"] === "patientResource") {
          const patientResource: FhirBaseResource = Parameters.getValue(parametersResource, "patientResource") as FhirBaseResource;
          this.patientSummary = new PatientSummary(patientResource);
        }
      });
      this.batchId = Parameters.getValue(parametersResource, "batchId") as string;
      this.formName = Parameters.getValue(parametersResource, "jobPackage") as string;
      this.started = Parameters.getValue(parametersResource, "jobStartDateTime") as string;
      this.status = Parameters.getValue(parametersResource, "batchJobStatus") as string;
    }
  }

  batchId: string;
  patientSummary: PatientSummary;
  formName: string; // Equivalent to JobPackage in the Parameters.
  started: string; // TODO: Parse to DateTime
  status: string;

}
