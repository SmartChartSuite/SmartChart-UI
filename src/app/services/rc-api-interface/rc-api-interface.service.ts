import {Injectable} from '@angular/core';
import {ConfigService} from "../config/config.service";
import {map, Observable, share, shareReplay} from "rxjs";
import {HttpClient, HttpContext} from "@angular/common/http";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {StartJobsPostBody} from "../../models/rc-api/start-jobs-post-body";
import {StartJobsPostResponse} from "../../models/rc-api/start-jobs-post-response";
import {PatientSearchParameters} from "../../models/rc-api/patient-search-parameters";
import {PatientSummary} from "../../models/patient-summary";
import {PatientGroup} from "../../models/patient-group";
import {FormSummary} from "../../models/form-summary";
import {ActiveFormSummary} from "../../models/active-form-summary";
import {Parameters} from "../../models/fhir/fhir.parameters.resource";
import {NlpAnswer, Results, ResultSet} from "../../models/results";
import {Bundle, BundleEntryComponent} from "../../models/fhir/fhir.bundle.resource";
import {ShowLoading} from "../loading/show-loading";
import testResponse from '../../../assets/temp/ui-for-testing.json';
import {RcApiConfig} from "../../models/rc-api/rc-api-config";

@Injectable({
  providedIn: 'root'
})
export class RcApiInterfaceService {
  private base = "smartchartui"
  configEndpoint: string = `config`;
  patientEndpoint: string = `${this.base}/Patient`; // FHIR Conformant.
  groupEndpoint: string = `${this.base}/group`;
  questionnaireEndpoint: string = `${this.base}/questionnaire`;
  startJobsEndpoint: string = `${this.base}/batchjob?include_patient=True`;
  getJobPackageEndpoint: string = `forms`;
  getBatchJobsEndpoint: string = `${this.base}/batchjob`
  getResultsEndpoint: string = `${this.base}/results`
  testResponse = testResponse;

  getQuestionTypes$ = this.getSmartChartUiQuestionnaires().pipe(
    shareReplay(1)
  );

  constructor(private configService: ConfigService,
              private http: HttpClient) {
  }

  /**
   * Request environment based configuration, e.g. custom primary identifier.
   */

  getConfig(): Observable<RcApiConfig> {
    return this.http.get<RcApiConfig>(this.configService.config.rcApiUrl + this.configEndpoint);
  }

  /**
   * Request a specific Patient resource from the EHR from RC API by their FHIR ID. FHIR pass through for SmartChart UI.
   * @param id - The patient's FHIR ID.
   */
  readPatient(id: string): Observable<FhirBaseResource> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.patientEndpoint}/${id}`);
  }

  /**
   * Search all Patient resources. FHIR pass through for SmartChart UI.
   * TODO: Implement search (in addition to read) endpoint that can handle parameters in the API
   * TODO: TABLED FOR LATER
   */
  searchPatient(searchParameters?: PatientSearchParameters): Observable<PatientSummary[]> {
    const searchPatientUrl = this.configService.config.rcApiUrl + `${this.patientEndpoint}`;
    searchParameters = this.mapParameterKeysToFHIR(searchParameters);

    let patientSearch$: Observable<any>;
    if (!searchParameters) {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl);
    }
    else {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl, {params: searchParameters})
    }

    return patientSearch$.pipe(
      map((bundle: Bundle) => {
        const entries = bundle.entry || [];
        let patientSummaryList: PatientSummary[] = [];
        entries.forEach((bec: BundleEntryComponent) => {
          let patientSummary = new PatientSummary(bec.resource);
          patientSummaryList.push(patientSummary);
        })
        return patientSummaryList;
      })
    )
  }

  private mapParameterKeysToFHIR(searchParameters: PatientSearchParameters): PatientSearchParameters {
    if (Object.keys(searchParameters).includes("fhirId")) {
      Object.defineProperty(searchParameters, "_id",
        Object.getOwnPropertyDescriptor(searchParameters, "fhirId"));
      delete searchParameters["fhirId"];
    }
    if (Object.keys(searchParameters).includes("dob")) {
      Object.defineProperty(searchParameters, "birthdate",
        Object.getOwnPropertyDescriptor(searchParameters, "dob"));
      delete searchParameters["dob"];
      searchParameters["birthdate"] = (searchParameters["birthdate"] as unknown as Date).toISOString().split("T")[0];
    }
    return searchParameters;
  }

  /**
   * Search all Group resources. FHIR pass through for SmartChart UI.
   */
  searchGroup(): Observable<any> {
    const groups$ = this.http.get<any[]>(this.configService.config.rcApiUrl + `${this.groupEndpoint}`).pipe(
      map(results => {
        const groupList: FhirBaseResource[] = results.filter(resource => resource.resourceType === "Group");
        const patientList: FhirBaseResource[] = results.filter(resource => resource.resourceType === "Patient");
        return groupList.map(groupResource => new PatientGroup(groupResource, patientList));
      })
    );
    return groups$.pipe();
  }

  /**
   * Search SmartChart UI Questionnaire Resources. FHIR pass through for SmartChart UI. Returns a list of FormSummary objects. To get a full form/questionnaire, see getJobPackage.
   */
  getSmartChartUiQuestionnaires(): Observable<FormSummary[]> {
    return this.http.get<FhirBaseResource[]>(this.configService.config.rcApiUrl + `${this.questionnaireEndpoint}`).pipe(
      map(resultsList => {
        let formSummaryList: FormSummary[];
        formSummaryList = resultsList.map(questionnaireResource=> new FormSummary(questionnaireResource));
        return formSummaryList;
      })
    );
  }

  /**
   * Get a JobPackage questionnaire by the name of the Job Package using the standard RC API Endpoint.
   */
  getJobPackage(jobPackage: string): Observable<any> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}/${jobPackage}`);
  }

  /**
   * Start Jobs Async
   * jobPackage = "name" in the FHIR Questionnaire
   */
  startJobs(patientId: string, jobPackage: string): Observable<StartJobsPostResponse> {
    const postBody = new StartJobsPostBody(patientId, jobPackage);
    return this.http.post<StartJobsPostResponse>(this.configService.config.rcApiUrl + this.startJobsEndpoint, postBody, {context: new HttpContext().set(ShowLoading, true)});
  }

  /**
   * This will return all Batch Jobs, which is functionally the list of "active" (completed, in progress, and otherwise terminated) cases.
   * This is returned as a flat list of FHIR Parameter JSON objects.
   */
  getBatchJobs() {
    return this.http.get<Parameters[]>(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + "?include_patient=True").pipe(
      map((response: Parameters[]) => {
        let activeJobList: ActiveFormSummary[] = [];
        response.forEach(parametersResource => {
          // TODO: Fetch Patient, need to setup as merge map? What is the right approach here? @Plamen
          activeJobList.push(new ActiveFormSummary(parametersResource));
        });
        return activeJobList;
      })
    );
  }

  getBatchJob(id: string) {
    return this.http.get(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + `/${id}?include_patient=True`)
  }

  getBatchJobResults(id: string): Observable<Results> {
    return this.http.get<Bundle>(this.configService.config.rcApiUrl + this.getResultsEndpoint + `/${id}`).pipe(
      map((batchResultsBundle: Bundle) => {
        // TODO: Add validation if not bundle or structure is not as expected (e.g. location of statusObservation/patientResource)
        // TODO: Simplify/condense code once confirmed working
        const bundleEntries = batchResultsBundle.entry;
        const statusObservation = bundleEntries.shift();
        const patientResource = bundleEntries.shift();
        const answerObservationList = bundleEntries.filter(bec => this.isRcApiObservation(bec.resource));
        const evidenceList = bundleEntries.filter(bec => !this.isRcApiObservation(bec.resource));

        const results: Results = new Results();
        results.subject = patientResource.resource;

        const statusObservationResource = statusObservation?.resource;
        const statusCodeableConcept = statusObservationResource?.["valueCodeableConcept"];
        results.status = statusCodeableConcept?.["coding"]?.[0]?.["code"] || "error";

        const statusCodeableConceptText = statusCodeableConcept?.["text"];
        const completeTotalJobsAsString = statusCodeableConceptText?.split(":")?.[1].trim();
        results.completeJobs = Number(completeTotalJobsAsString?.split("/")?.[0]);
        results.totalJobs = Number(completeTotalJobsAsString?.split("/")?.[1]);
        answerObservationList.forEach(bec => {
          const answerObservation = bec.resource;
          const linkId: string = `link${answerObservation?.["code"]?.["coding"]?.[0]?.["code"]}`
          const isNlpqlAnswer = this.isNlpqlAnswer(answerObservation);
          if (!(linkId in results)) {
            results[linkId] = new ResultSet();
            results[linkId].evidence = [];
          }

          if (isNlpqlAnswer){
            let nlpAnswer = new NlpAnswer();

            nlpAnswer.term = answerObservation["valueString"];
            nlpAnswer.fragment = answerObservation["note"]?.[0]?.["text"];
            nlpAnswer.evidenceReferenceList = this.createReferenceList(answerObservation?.["focus"]);

            let documentReference = this.findDocumentReference(nlpAnswer.evidenceReferenceList[0], evidenceList)
            nlpAnswer.date = documentReference["date"]; // From DocumentReference
            nlpAnswer.fullText = documentReference["content"][0]["attachment"]["data"];

            if (!("nlpAnswers" in results[linkId])) {
              results[linkId].nlpAnswers = [];
            }
            results[linkId].nlpAnswers.push(nlpAnswer);
          }
          else {
            results[linkId].cqlAnswer = answerObservation;
          }

          if (answerObservation?.["focus"]) {
            const referenceList: string[] = this.createReferenceList(answerObservation?.["focus"]);

            let filteredEvidenceList: FhirBaseResource[] = [];
            // TODO: Switch to filter.
            evidenceList?.forEach(bec => {
              if (referenceList?.includes(bec.fullUrl)) {
                filteredEvidenceList?.push(bec.resource)
              }
            });

            results[linkId].evidence.push(...filteredEvidenceList);
            // TODO: leverage Set sooner to avoid this extra clean up call
            results[linkId].evidence = [... new Set(results[linkId].evidence)];
          }
        });
        return results;
      })
    ).pipe(share())
  }

  createReferenceList(focusElement: []): string[] {
    const referenceList: string[] = [];
    focusElement?.forEach((reference: any) => referenceList.push(reference["reference"]));
    return referenceList;
  }

  findDocumentReference(reference: string, evidenceBecList: BundleEntryComponent[]): FhirBaseResource {
    const bec = evidenceBecList.find(bec => bec.fullUrl === reference);
    return bec.resource;
  }

  isRcApiObservation(resource: FhirBaseResource): boolean {
    if (resource.resourceType !== "Observation"){
      return false;
    }
    else {
      return resource?.["code"]?.["coding"]?.[0]?.["system"]?.startsWith("urn:gtri:heat:form");
    }
  }

  isNlpqlAnswer(resource: FhirBaseResource): boolean {
    if (resource?.["focus"]?.[0]?.["reference"].startsWith("DocumentReference")) {
      return true;
    }
    else {
      return false;
    }
  }
}
