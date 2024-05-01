import {PatientSummary} from "./patient-summary";
import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class PatientGroup {
  constructor(groupResource: FhirBaseResource, patientList: FhirBaseResource[]) {
    this.groupName = groupResource["name"];
    this.members = [];
    groupResource["member"].forEach((member: any) => {
      const memberId = member["entity"]["reference"].split("/").slice(-1)[0];
      const memberResource = patientList.find(patientResource => patientResource.id === memberId);
      if (memberResource) {
        this.members.push(new PatientSummary(memberResource));
      }
      else {
        console.error(`Patient ${memberId} not provided. This is either an error in the Group resource member list or a network issue when reading the Patient.`)
      }
    });
  }

  groupName: string;
  members: PatientSummary[];
}
