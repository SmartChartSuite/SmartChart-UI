import {Parameter, Parameters} from "./fhir.parameters.resource";

export class StartJobsPostBody extends Parameters{
  constructor(patientId: string, jobPackage: string) {
    super();
    this.addParameter(new Parameter("patientId", patientId));
    this.addParameter(new Parameter("jobPackage", jobPackage));
  }
}



