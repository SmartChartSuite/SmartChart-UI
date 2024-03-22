import {PatientSummary} from "./patient-summary";
import {FhirBaseResource} from "./rc-api/fhir.base.resource";

export class PatientGroup {
  constructor(groupResource: FhirBaseResource) {
    this.groupName = groupResource["name"];
    groupResource["member"].forEach((member: any) => {

      // Make call for the patient.
      // generate patient summary
      // push patient summary to this.members
    });
  }

  groupName: string;
  members: PatientSummary[]
}
