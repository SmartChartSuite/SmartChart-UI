import {FhirType} from "../fhir.type";
import {Identifier} from "./identifier";
import {FhirElement} from "../fhir.element";
import {Uri} from "../fhir.primitive";

export class Reference extends FhirType {
  reference?: string;
  _reference?: FhirElement;
  type?: Uri;
  _type?: FhirElement;
  identifier?: Identifier;
  display?: string;
  _display?: FhirElement;
}
