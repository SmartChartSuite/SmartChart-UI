import {FhirType} from "../fhir.type";
import {Code, Uri} from "../fhir.primitive";
import {FhirElement} from "../fhir.element";

export class Coding extends FhirType {
  system?: Uri;
  _system?: FhirElement;
  version?: string;
  _version?: FhirElement;
  code?: Code;
  _code?: FhirElement;
  display?: string;
  _display?: FhirElement;
  userSelected?: boolean;
  _userSelected?: FhirElement;
}
