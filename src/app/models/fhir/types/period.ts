import {FhirType} from "../fhir.type";
import {FhirElement} from "../fhir.element";

export class Period extends FhirType {
  start?: string;
  _start?: FhirElement;
  end?: string;
  _end?: FhirElement;
}
