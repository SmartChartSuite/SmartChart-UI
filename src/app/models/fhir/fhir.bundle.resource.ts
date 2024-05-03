/*
 * https://hl7.org/fhir/R4/bundle.html
 */

import {FhirBaseResource} from "./fhir.base.resource";
import {BackboneElement} from "./fhir.backbone-element";
import {FhirElement} from "./fhir.element";
import {Code, Decimal, Instant, Uri} from "./fhir.primitive";

export class Bundle implements FhirBaseResource {
  resourceType: string = "Bundle";
  entry?: BundleEntryComponent[];
}

export class Link extends BackboneElement {
  relation: string;
  _relation?: FhirElement;
  url: Uri;
  _url?: FhirElement;
}

export class BundleEntryComponent extends BackboneElement {
  link?: Link;
  fullUrl?: Uri;
  _fullUrl?: FhirElement;
  resource?: FhirBaseResource;
  search?: Search;
  request?: RequestComponent;
  response?: Response;
}

export class Search extends BackboneElement {
  mode?: Code; // TODO: SearchEntryMode VS
  _mode?: FhirElement;
  score?: Decimal;
  _score?: FhirElement;
}

export class RequestComponent extends BackboneElement {
  method: string;
  _method?: FhirElement;
  url: Uri;
  _url?: FhirElement;
  ifNoneMatch?: string;
  _ifNoneMatch?: FhirElement;
  ifModifiedSince?: Instant;
  _ifModifiedSince?: FhirElement;
  ifMatch?: string;
  _ifMatch?: FhirElement;
  ifNoneExist?: string;
  _ifNoneExist?: string;
}

export class Response extends BackboneElement {
  status: string;
  _status?: FhirElement;
  location?: Uri;
  _location?: FhirElement;
  etag?: string;
  _etag?: FhirElement;
  lastModified?: Instant;
  _lostModified?: FhirElement;
  outcome?: FhirBaseResource; // OperationOutcome
}


