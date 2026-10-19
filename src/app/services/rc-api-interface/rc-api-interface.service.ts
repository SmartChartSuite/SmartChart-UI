import {Injectable} from '@angular/core';
import {ConfigService} from "../config/config.service";
import {map, Observable, share, shareReplay} from "rxjs";
import {HttpClient, HttpContext, HttpParams} from "@angular/common/http";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {StartJobsPostBody} from "../../models/rc-api/start-jobs-post-body";
import {StartJobsPostResponse} from "../../models/rc-api/start-jobs-post-response";
import {PatientSearchParameters} from "../../models/rc-api/patient-search-parameters";
import {PatientSummary} from "../../models/patient-summary";
import {PatientGroup} from "../../models/patient-group";
import {FormSummary} from "../../models/form-summary";
import {ActiveFormSummary} from "../../models/active-form-summary";
import {Parameters} from "../../models/fhir/fhir.parameters.resource";
import {Results, ResultSet} from "../../models/results";
import {Bundle, BundleEntryComponent} from "../../models/fhir/fhir.bundle.resource";
import {ShowLoading} from "../loading/show-loading";
import {RcApiConfig} from "../../models/rc-api/rc-api-config";
import {JobsFormsHelperService, PatientData} from "../helper/jobs-forms-helper.service";
import {QuestionnaireResponse} from "../../models/fhir/resources/fhir.questionnaireresponse";


@Injectable({
  providedIn: 'root'
})
export class RcApiInterfaceService {
  private base  = this.configService.config.rcApiUrl;
  configEndpoint: string = `${this.base}config`;
  patientEndpoint: string = `${this.base}patient`; // FHIR Conformant.
  groupEndpoint: string = `${this.base}group`;
  questionnaireEndpoint: string = `${this.base}jobpackage`;
  startJobsEndpoint: string = `${this.base}batchjob?include_patient=True`;
  getJobPackageEndpoint: string = `${this.base}jobpackage`;
  batchJobsEndpoint: string = `${this.base}batchjob`
  getResultsEndpoint: string = `${this.base}results`

  getQuestionTypes$ = this.getSmartChartUiQuestionnaires().pipe(
    map(response => response.sort((a, b) => a.title.localeCompare(b.title))),
    shareReplay(1)
  );

  constructor(private configService: ConfigService,
              private http: HttpClient,
              private jobsFormsHelper: JobsFormsHelperService) {
  }

  /**
   * Request environment based configuration, e.g. custom primary identifier.
   */

  getConfig(): Observable<RcApiConfig> {
    return this.http.get<RcApiConfig>(this.configEndpoint);
  }

  /**
   * Request a specific Patient resource from the EHR from RC API by their FHIR ID. FHIR pass through for SmartChart UI.
   * @param id - The patient's FHIR ID.
   */
  getPatient(id: string): Observable<FhirBaseResource> {
    return this.http.get<FhirBaseResource>(`${this.patientEndpoint}/${id}`);
  }

  /**
   * Search all Patient resources. FHIR pass through for SmartChart UI.
   * TODO: Implement search (in addition to read) endpoint that can handle parameters in the API
   * TODO: TABLED FOR LATER
   */
  searchPatient(searchParameters?: PatientSearchParameters): Observable<PatientSummary[]> {
    const searchPatientUrl = `${this.patientEndpoint}`;
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


  getFormJobsPatientData(page: number = 0, size: number = 10, filters?: any): Observable<PatientData> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      const mappings = {
        patientName: 'patientName',
        dobStartDate: 'dobStartDate',
        dobEndDate: 'dobEndDate',
        jobRunStartDate: 'jobRunStartDate',
        jobRunEndDate: 'jobRunEndDate',
        jobPackage: 'jobPackage',
      };

      Object.entries(mappings).forEach(([filterKey, paramKey]) => {
        if (filters[filterKey]) {
          params = params.set(paramKey, filters[filterKey]);
        }
      });

      ['patientGender', 'questionnaireResponseStatus', 'batchJobStatus'].forEach((key) => {
        if (filters[key]?.length) {
          params = params.set(key, filters[key].join(','));
        }
      });
    }

    return this.http.get<Bundle>(`${this.batchJobsEndpoint}`, { params }).pipe(
      map(response => this.jobsFormsHelper.toPatientData(response))
    );
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
    const groups$ = this.http.get<any[]>(`${this.groupEndpoint}`).pipe(
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
    return this.http.get<FhirBaseResource[]>(`${this.questionnaireEndpoint}`).pipe(
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
  // getJobPackage(jobPackage: string): Observable<any> {
  //   console.log(jobPackage);
  //  //return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}/${jobPackage}`);
  //   // TODO: see new api and refactor the code to handle accordingly
  //   return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}?name=${jobPackage}`);
  // }

  getJobPackage(parameters: { key: string; value: string }): Observable<any> {
    const params = { [parameters.key]: parameters.value };

    return this.http.get<FhirBaseResource>(this.getJobPackageEndpoint,
      { params }
    );

    // return this.http.get<FhirBaseResource>('assets/temp/ui-for-testing.json',
    //   { params }
    // );
  }

  /**
   * Start Jobs Async
   * jobPackage = "name" in the FHIR Questionnaire
   */
  startJobs(patientId: string, jobPackage: string): Observable<StartJobsPostResponse> {
    const postBody = new StartJobsPostBody(patientId, jobPackage);
    return this.http.post<StartJobsPostResponse>(this.startJobsEndpoint, postBody, {context: new HttpContext().set(ShowLoading, true)});
  }

  // /**
  //  * This will return all Batch Jobs, which is functionally the list of "active" (completed, in progress, and otherwise terminated) cases.
  //  * This is returned as a flat list of FHIR Parameter JSON objects.
  //  */
  // getBatchJobs() {
  //   return this.http.get<Parameters[]>(this.getBatchJobsEndpoint + "?include_patient=True").pipe(
  //     map((response: Parameters[]) => {
  //       let activeJobList: ActiveFormSummary[] = [];
  //       response.forEach(parametersResource => {
  //         // TODO: Fetch Patient, need to setup as merge map? What is the right approach here? @Plamen
  //         activeJobList.push(new ActiveFormSummary(parametersResource));
  //       });
  //       return activeJobList;
  //     })
  //   );
  // }

  getBatchJobs() {
    return this.http.get<Bundle>(this.batchJobsEndpoint + "?include_patient=True").pipe(
      map((response: Bundle) => {
        let activeJobList: ActiveFormSummary[] = [];
        response.entry.forEach(parametersResource => {
          const resource = parametersResource.resource as Parameters;
          activeJobList.push(new ActiveFormSummary(resource));
        });
        return activeJobList;
      })
    );
  }

  getBatchJobById(id: string) {
    return this.http.get(this.batchJobsEndpoint + `/${id}?include_patient=True`)
  }

  /**
   * Fetches a batch job's results bundle and reshapes it into {@link Results}.
   *
   * The bundle is laid out as: the job status Observation, the Patient, then the
   * answer Observations and the resources they reference as evidence. Answers
   * are grouped per question under a `link{linkId}` key.
   */
  getBatchJobResults(id: string): Observable<Results> {
    return this.http.get<Bundle>(`${this.batchJobsEndpoint}/${id}`).pipe(
      map(batchResultsBundle => this.parseBatchJobResults(batchResultsBundle)),
      share()
    );
  }

  /** Reshapes a batch job results bundle into the {@link Results} view model. */
  private parseBatchJobResults(batchResultsBundle: Bundle): Results {
    // TODO: Add validation if not bundle or structure is not as expected
    // (e.g. location of statusObservation/patientResource)
    const [statusEntry, patientEntry, ...remainingEntries] = batchResultsBundle?.entry ?? [];

    const answerEntries = remainingEntries.filter(entry => this.isRcApiObservation(entry.resource));
    const evidenceEntries = remainingEntries.filter(entry => !this.isRcApiObservation(entry.resource));
    // Answers reference their evidence by the entry's fullUrl.
    const evidenceByUrl = new Map(evidenceEntries.map(entry => [entry.fullUrl, entry.resource]));

    const results = new Results();
    results.subject = patientEntry?.resource;
    this.applyJobStatus(results, statusEntry?.resource);

    for (const {resource: answerObservation} of answerEntries) {
      const resultSet = this.getOrCreateResultSet(results, this.getLinkId(answerObservation));

      if (this.isNlpqlAnswer(answerObservation)) {
        resultSet.nlpAnswerObservations.push(answerObservation);
      } else {
        resultSet.cqlAnswer = answerObservation;
      }

      this.addEvidence(resultSet, answerObservation, evidenceByUrl);
    }

    return results;
  }

  /**
   * Reads the job status and progress from the status Observation. The progress
   * is carried as text in the form `"<label>: <complete>/<total>"`.
   */
  private applyJobStatus(results: Results, statusObservation: FhirBaseResource | undefined): void {
    const statusCodeableConcept = statusObservation?.["valueCodeableConcept"];
    results.status = statusCodeableConcept?.["coding"]?.[0]?.["code"] || "error";

    const [complete, total] = (statusCodeableConcept?.["text"]?.split(":")?.[1] ?? "")
      .trim()
      .split("/");
    results.completeJobs = Number(complete);
    results.totalJobs = Number(total);
  }

  /** The `link{linkId}` key an answer Observation belongs to. */
  private getLinkId(answerObservation: FhirBaseResource): string {
    return `link${answerObservation?.["code"]?.["coding"]?.[0]?.["code"]}`;
  }

  /** Returns the result set for a question, creating it on first use. */
  private getOrCreateResultSet(results: Results, linkId: string): ResultSet {
    results[linkId] ??= new ResultSet();
    return results[linkId];
  }

  /**
   * Adds the resources an answer Observation references via `focus` to the
   * result set's evidence, skipping references already collected for it.
   */
  private addEvidence(
    resultSet: ResultSet,
    answerObservation: FhirBaseResource,
    evidenceByUrl: Map<string, FhirBaseResource>
  ): void {
    for (const reference of this.createReferenceList(answerObservation?.["focus"])) {
      const evidence = evidenceByUrl.get(reference);
      if (evidence && !resultSet.evidence.includes(evidence)) {
        resultSet.evidence.push(evidence);
      }
    }
  }

  /** The `focus` references of an answer Observation. */
  private createReferenceList(focusElement: { reference?: string }[] | undefined): string[] {
    return (focusElement ?? [])
      .map(focus => focus?.reference)
      .filter((reference): reference is string => !!reference);
  }

  /** True when the resource is an answer Observation produced by RC API. */
  private isRcApiObservation(resource: FhirBaseResource | undefined): boolean {
    return resource?.resourceType === "Observation"
      && !!resource?.["code"]?.["coding"]?.[0]?.["system"]?.startsWith("urn:gtri:heat:form");
  }

  /** NLPQL answers are the ones whose evidence is a DocumentReference. */
  private isNlpqlAnswer(resource: FhirBaseResource | undefined): boolean {
    return !!resource?.["focus"]?.[0]?.["reference"]?.startsWith("DocumentReference");
  }

  updateQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse, questionnaireResponseId: string) {
    return this.http.put<any>(`${this.base}response/${questionnaireResponseId}`, questionnaireResponse)
  }

  getQuestionnaireResponse(qrId: string): Observable<QuestionnaireResponse> {
    return this.http.get<QuestionnaireResponse>(`${this.base}response/${qrId}`);
  }

  deleteBatchJob(batchJobId: string) {
    return this.http.delete(`${this.batchJobsEndpoint}/${batchJobId}`);
  }
}
