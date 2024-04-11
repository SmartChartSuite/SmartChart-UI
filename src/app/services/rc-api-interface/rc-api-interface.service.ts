import { Injectable } from '@angular/core';
import {ConfigService} from "../config/config.service";
import {map, Observable, of, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {FhirBaseResource} from "../../models/rc-api/fhir.base.resource";
import {StartJobsPostBody} from "../../models/rc-api/start-jobs-post-body";
import {StartJobsPostResponse} from "../../models/rc-api/start-jobs-post-response";
import {PatientSearchParameters} from "../../models/rc-api/patient-search-parameters";
import {PatientSummary} from "../../models/patient-summary";
import {PatientGroup} from "../../models/patient-group";
import {FormSummary} from "../../models/form-summary";
import {ActiveFormSummary} from "../../models/active-form-summary";
import {Parameters} from "../../models/rc-api/fhir.parameters.resource";

@Injectable({
  providedIn: 'root'
})
export class RcApiInterfaceService {
  private base = "smartchartui"
  patientEndpoint: string = `${this.base}/patient`;
  groupEndpoint: string = `${this.base}/group`;
  questionnaireEndpoint: string = `${this.base}/questionnaire`;
  startJobsEndpoint: string = `forms/start?asyncFlag=True`;
  getJobPackageEndpoint: string = `forms`;
  getBatchJobsEndpoint: string = `${this.base}/batchjob`

  constructor(private configService: ConfigService,
              private http: HttpClient) {
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
   * TODO: Implement Parameters.
   */
  searchPatient(searchParameters?: PatientSearchParameters): Observable<PatientSummary[]> {
    const searchPatientUrl = this.configService.config.rcApiUrl + `${this.patientEndpoint}`;
    let patientSearch$ = new Observable();
    if (!searchParameters) {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl);
    }
    else {
      patientSearch$ = this.http.get<FhirBaseResource>(searchPatientUrl, {params: searchParameters})
    }

    return patientSearch$.pipe(
      map((value: any) => {
        const entries = value["entry"];
        let patientSummaries: PatientSummary[] = [];
        // TODO Map entries to Patient Summaries and add to list.
        return patientSummaries;
      })
    )
  }

  /**
   * Search all Group resources. FHIR pass through for SmartChart UI.
   */
  searchGroup(): Observable<any> {
    const groups$ = this.http.get<any[]>(this.configService.config.rcApiUrl + `${this.groupEndpoint}`).pipe(
      map(groupList => {
        groupList.forEach(value => {
          console.log(value)
          value.member.forEach((member: any) => console.log(member.entity.reference))
          //this.readPatient(value.id)
          // for each patient fetched build summary
        })

        return [{
          "groupName": "Group 1",
          "patients": [
            {} // PATIENT SUMMARY OBJECT
          ]
        }]
      })
    );

    const mockData: PatientGroup[] = [{
      "groupName": "Group 1",
      "members": [
        {fhirId: "1", name: {given: ["Bob"], family: "Smith"}, birthDate: new Date("1960-07-12"), gender: "male"}, // PATIENT SUMMARY OBJECT
        {fhirId: "2", name: {given: ["Sarah"], family: "Cubin"}, birthDate: new Date("1989-02-14"), gender: "female"} // PATIENT SUMMARY OBJECT
      ]},
      {
        "groupName": "Group 2",
        "members": [
          {fhirId: "3", name: {given: ["Jeremy"], family: "Sanders"}, birthDate: new Date("2015-12-30"), gender: "male"}, // PATIENT SUMMARY OBJECT
        ]}
    ]
    const groupsMock$ = of(mockData)
    return groupsMock$.pipe();
  }

  /**
   * Search SmartChart UI Questionnaire Resources. FHIR pass through for SmartChart UI. Returns a list of FormSummary objects. To get a full form/questionnaire, see getJobPackage.
   */
  getSmartChartUiQuestionnaires(): Observable<FormSummary[]> {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.questionnaireEndpoint}`).pipe(
      map(value => {

        return [
          {
            "name": "SETNETInfantFollowUp",
            "title": "SETNET - Infant Follow Up"
          }
        ];
      })
    );
  }

  /**
   * Get a JobPackage questionnaire by the name of the Job Package using the standard RC API Endpoint.
   */
  getJobPackage(jobPackage: string) {
    return this.http.get<FhirBaseResource>(this.configService.config.rcApiUrl + `${this.getJobPackageEndpoint}/${jobPackage}`);
  }

  /**
   * Start Jobs Async
   * jobPackage = "name" in the FHIR Questionnaire
   */
  startJobs(patientId: string, jobPackage: string): Observable<StartJobsPostResponse> {
    const postBody = new StartJobsPostBody(patientId, jobPackage)
    return this.http.post<StartJobsPostResponse>(this.configService.config.rcApiUrl + this.startJobsEndpoint, postBody);
  }

  /**
   * This will return all Batch Jobs, which is functionally the list of "active" (completed, in progress, and otherwise terminated) cases.
   * This is returned as a flat list of FHIR Parameter JSON objects.
   */
  getBatchJobs() {
    // const batchJobs$ = this.http.get<Parameters[]>(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + "?include_patient=True").pipe(
    //   map((response: Parameters[]) => {
    //     let activeJobList: ActiveFormSummary[] = [];
    //     response.forEach(parametersResource => {
    //       // TODO: Fetch Patient, need to setup as merge map? What is the right approach here? @Plamen
    //       activeJobList.push(new ActiveFormSummary(parametersResource));
    //     });
    //     return activeJobList;
    //   })
    // )
    // return batchJobs$;

    const mockData = [{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"50448c1a-7bcc-487c-b10e-ee3b98adef11"},{"name":"patientId","valueString":"625171"},{"name":"jobPackage","valueString":"SyphilisRegistry"},{"name":"jobStartDateTime","valueDateTime":"2024-03-29T14:42:34+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"4e04da25-c37a-49d7-b166-df051a101b2c"}},{"item":{"display":"29d450c6-25c8-402e-86fc-6fe2a36e2973"}},{"item":{"display":"d189214d-360e-4f23-b307-b078e077e449"}},{"item":{"display":"cb22a03b-ddcf-40ef-9a86-b6411744141b"}},{"item":{"display":"4d1a9cd0-3c97-4756-a7ca-313b0eb8b28f"}},{"item":{"display":"5b11ab48-2d42-4e42-9171-0157528cc000"}},{"item":{"display":"7d78bb4c-5035-44d4-81cb-11e059e61965"}},{"item":{"display":"de1f28b5-a74d-4d7c-bfa0-0888be8ff78b"}},{"item":{"display":"4a40dd11-3eab-4143-8165-8a2cd452bbf7"}},{"item":{"display":"86c6cb89-60ad-4ad7-9f65-89950c07fd16"}},{"item":{"display":"35630bd0-6c18-4924-b12d-4bae8ec390a3"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625171","meta":{"versionId":"1","lastUpdated":"2023-11-30T21:13:32.602000+00:00","source":"#ZzLCOE8fQ0JLYkDO","profile":["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2106-3","display":"White"}},{"url":"text","valueString":"White"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"}],"identifier":[{"value":"19619474"}],"active":true,"name":[{"family":"Syph","given":["Sally"]}],"telecom":[{"system":"phone","value":"470-028-9228","use":"home"}],"gender":"other","birthDate":"2150-04-28"}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"15787a18-86bf-4f3c-988a-884a9ff085a8"},{"name":"patientId","valueString":"625171"},{"name":"jobPackage","valueString":"SyphilisRegistry"},{"name":"jobStartDateTime","valueDateTime":"2024-03-29T14:42:49+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"bc51f6ef-b75a-42d4-a4e1-e7b03be270f3"}},{"item":{"display":"a00aab13-356a-422a-b27d-615ee4d8b3bb"}},{"item":{"display":"952f7964-0406-455c-a7e4-ec4b17f7bb5d"}},{"item":{"display":"3e9fec8c-ccc5-4e22-8bb4-61414da65131"}},{"item":{"display":"feb7d6e1-3ef2-41ff-a9af-3cffdb9f3ab2"}},{"item":{"display":"36a5826d-01d6-4b22-a0ab-b82ff62e0923"}},{"item":{"display":"789ba957-2334-4d26-8630-8f3a8a7791a3"}},{"item":{"display":"ce802c87-dce7-486f-9c52-6ec8bc5f06c5"}},{"item":{"display":"6351c44c-5d55-4718-b290-adc32551f68d"}},{"item":{"display":"3926991b-6973-4c0f-95b1-f69ee0671485"}},{"item":{"display":"82ffc8eb-6fe2-4b99-ac69-fc42c1a9c521"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625171","meta":{"versionId":"1","lastUpdated":"2023-11-30T21:13:32.602000+00:00","source":"#ZzLCOE8fQ0JLYkDO","profile":["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2106-3","display":"White"}},{"url":"text","valueString":"White"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"}],"identifier":[{"value":"19619474"}],"active":true,"name":[{"family":"Syph","given":["Sally"]}],"telecom":[{"system":"phone","value":"470-028-9228","use":"home"}],"gender":"other","birthDate":"2150-04-28"}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"9ff52cfe-8e19-4a76-ab88-7c0235d3d7e0"},{"name":"patientId","valueString":"625747"},{"name":"jobPackage","valueString":"SETNETInfantFollowUp"},{"name":"jobStartDateTime","valueDateTime":"2024-04-02T15:30:26+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"0b68cd9e-578f-40f6-b9e6-8c97817c8d63"}},{"item":{"display":"71f9b515-502b-49a0-807b-8d356024215a"}},{"item":{"display":"6cfcf408-a28f-4d43-a6d6-ca425858489b"}},{"item":{"display":"577f011a-812b-4e7c-9dcb-b8408b0a4231"}},{"item":{"display":"f0c3b8be-e49e-404e-bd16-09d1813120e2"}},{"item":{"display":"7773612e-f4ee-4760-9563-84ba37dfb686"}},{"item":{"display":"38548873-f1c2-42bb-9c6b-0e4067b16448"}},{"item":{"display":"612fdc24-1e26-4466-a121-7f2c9404a02c"}},{"item":{"display":"30dd727b-117e-4432-bd64-eaeffc380abd"}},{"item":{"display":"cc31b30e-d070-4dff-8953-af0d62c0336a"}},{"item":{"display":"11268958-6590-40fe-a290-47ce23f29a9c"}},{"item":{"display":"e0b2d09e-cc31-4431-9a72-fd1d2f987742"}},{"item":{"display":"61ea0021-c942-4b37-9c01-e84567719cbb"}},{"item":{"display":"9d3361a5-60db-480a-a380-f10be0166265"}},{"item":{"display":"98c0faee-77e7-4fbb-b120-eeffa977dc4e"}},{"item":{"display":"1c9dea80-8130-4e1f-bd83-d42b75bac15c"}},{"item":{"display":"714a3221-c164-488c-844d-190bd829da48"}},{"item":{"display":"0c3aa520-24b0-469b-8b85-293d826e6356"}},{"item":{"display":"4e271f69-57f7-4e66-b9fe-3f5b6cc51398"}},{"item":{"display":"5c17c4be-cb5a-42d5-a8d3-56939231ad9a"}},{"item":{"display":"5375b3c0-c770-4874-ba62-44ebbcd22d71"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625747","meta":{"versionId":"1","lastUpdated":"2024-03-05T19:10:25.857000+00:00","source":"#q9nIZIi4tkjANnYw"},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"http://terminology.hl7.org/CodeSystem/v3-NullFlavor","code":"UNK","display":"Unknown"}},{"url":"text","valueString":"Unknown"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.39128","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-genderIdentity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/gender-identity","code":"male","display":"male"}]}},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.35144","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-birthTime","valueDateTime":"2150-01-01T14:53:00+00:00"}],"identifier":[{"use":"usual","type":{"text":"GA8"},"system":"urn:oid:1.2.840.114350.1.13.876.1.4.8.725198.0","value":"999888777"}],"active":true,"name":[{"use":"official","text":"Baby McBaby","family":"McBaby","given":["Baby"]}],"telecom":[{"system":"phone","value":"404-678-9876","use":"home"}],"gender":"male","birthDate":"2150-01-01","deceasedDateTime":"2152-01-01T00:00:00+00:00","address":[{"use":"home","line":["299 WEST PEACHTREE ROAD NORTHEAST"],"city":"ATLANTA","district":"FULTON","state":"GA","postalCode":"30308","country":"USA"}],"maritalStatus":{"text":"Single"},"multipleBirthInteger":1,"contact":[{"relationship":[{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.4.827665.1000","code":"8","display":"Mother"}]}],"name":{"use":"usual","text":"Mother McMother"}}],"communication":[{"language":{"coding":[{"system":"urn:ietf:bcp:47","code":"es","display":"Spanish"}]},"preferred":true}]}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"818e9562-22b4-4bd8-ae0f-e6bb09912396"},{"name":"patientId","valueString":"625747"},{"name":"jobPackage","valueString":"SETNETInfantFollowUp"},{"name":"jobStartDateTime","valueDateTime":"2024-04-02T15:44:46+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"8e404ac7-ca3a-4feb-be2d-8a026e21f129"}},{"item":{"display":"7c22699c-1931-4e94-baa4-925493f62876"}},{"item":{"display":"a31157ca-81dd-45f7-818e-28c68140d2ca"}},{"item":{"display":"0f7472c3-f52d-4fec-a27f-af378c877c8d"}},{"item":{"display":"00c059a0-4079-4ed9-b0ed-2f09fdba15b4"}},{"item":{"display":"82b293e1-018d-4e4c-8474-29402865c619"}},{"item":{"display":"8cfcdae9-4195-40a7-b8eb-3702b12cbd15"}},{"item":{"display":"6ff6bbb2-5e98-4750-99b9-87f9b5156754"}},{"item":{"display":"a5476ba9-7059-4afa-ad47-c65a7be923ce"}},{"item":{"display":"7c66c05a-abbb-471b-a729-950a6440b7ed"}},{"item":{"display":"2d79076c-ea81-4c63-aae0-31692e7a2d45"}},{"item":{"display":"d8ae3d4f-2d39-4b47-a785-22684ba48fab"}},{"item":{"display":"cbbe41e7-199c-422e-8b83-ca745d19c68d"}},{"item":{"display":"ec9eace8-f621-48fc-9ca7-c593c57eb4ea"}},{"item":{"display":"7b1e836a-35ff-4ef4-ac04-cfb076f762a7"}},{"item":{"display":"63fe6139-ba05-41bd-aee8-2327a72189a8"}},{"item":{"display":"952f3831-c8f4-49d9-8093-9fa5e501e05c"}},{"item":{"display":"4cf00be1-0017-48e3-895d-1ebc3c41c7b1"}},{"item":{"display":"37d77994-29bd-4bdd-b173-473a697073d5"}},{"item":{"display":"6457a29f-52d4-4baa-8e00-1cf923da254c"}},{"item":{"display":"824f4564-9583-44ab-8020-d541e5e1ef98"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625747","meta":{"versionId":"1","lastUpdated":"2024-03-05T19:10:25.857000+00:00","source":"#q9nIZIi4tkjANnYw"},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"http://terminology.hl7.org/CodeSystem/v3-NullFlavor","code":"UNK","display":"Unknown"}},{"url":"text","valueString":"Unknown"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.39128","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-genderIdentity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/gender-identity","code":"male","display":"male"}]}},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.35144","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-birthTime","valueDateTime":"2150-01-01T14:53:00+00:00"}],"identifier":[{"use":"usual","type":{"text":"GA8"},"system":"urn:oid:1.2.840.114350.1.13.876.1.4.8.725198.0","value":"999888777"}],"active":true,"name":[{"use":"official","text":"Baby McBaby","family":"McBaby","given":["Baby"]}],"telecom":[{"system":"phone","value":"404-678-9876","use":"home"}],"gender":"male","birthDate":"2150-01-01","deceasedDateTime":"2152-01-01T00:00:00+00:00","address":[{"use":"home","line":["299 WEST PEACHTREE ROAD NORTHEAST"],"city":"ATLANTA","district":"FULTON","state":"GA","postalCode":"30308","country":"USA"}],"maritalStatus":{"text":"Single"},"multipleBirthInteger":1,"contact":[{"relationship":[{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.4.827665.1000","code":"8","display":"Mother"}]}],"name":{"use":"usual","text":"Mother McMother"}}],"communication":[{"language":{"coding":[{"system":"urn:ietf:bcp:47","code":"es","display":"Spanish"}]},"preferred":true}]}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"c9890a3a-9584-46d4-bbcb-504a67c60f75"},{"name":"patientId","valueString":"625747"},{"name":"jobPackage","valueString":"SETNETInfantFollowUp"},{"name":"jobStartDateTime","valueDateTime":"2024-04-02T15:45:23+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"9de85a9d-d15d-4063-92ff-033d49086a12"}},{"item":{"display":"8b87239e-3c34-4fda-b76b-88ed7946d079"}},{"item":{"display":"f6ae6312-007c-45d2-a9de-528ab619a01d"}},{"item":{"display":"3be1e2e9-ed99-47e3-a225-97473bb8e62e"}},{"item":{"display":"65d6dd7d-072d-4f2f-94d9-66727b5ace75"}},{"item":{"display":"686b3524-0001-497c-aca9-00557af05804"}},{"item":{"display":"437a4e55-2150-4730-99ac-d4beeffbcb4a"}},{"item":{"display":"4b707452-ecb8-4d46-b98b-14488e9c601f"}},{"item":{"display":"9ea2824d-d3c5-4a07-8be5-c1156723519a"}},{"item":{"display":"7461b3a6-bc86-4cef-99ac-b64cdb54c2fc"}},{"item":{"display":"76a1f120-ade4-4bae-83e5-91005b57bd4b"}},{"item":{"display":"6a193f63-b442-40e5-97f5-b9027b1469c1"}},{"item":{"display":"e6632daf-3e20-479c-8971-631813e53f18"}},{"item":{"display":"f84b6d2b-07c1-4afc-9ca3-db196c3bd0fb"}},{"item":{"display":"55786162-8494-416a-8276-58c2536bda81"}},{"item":{"display":"2b4b0b64-9571-4449-a17d-8e0de048bb1c"}},{"item":{"display":"49306dd1-5096-4087-86df-35401e4b02b0"}},{"item":{"display":"0295321a-aa21-482b-af3c-bf06a6d26600"}},{"item":{"display":"2dcd696b-00aa-4a30-8f18-b100c4b8a478"}},{"item":{"display":"a7be9858-01c5-49e3-9d80-7060b1c9f42c"}},{"item":{"display":"28c9aae9-6abe-4fa0-96dd-1ae7494f55ea"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625747","meta":{"versionId":"1","lastUpdated":"2024-03-05T19:10:25.857000+00:00","source":"#q9nIZIi4tkjANnYw"},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"http://terminology.hl7.org/CodeSystem/v3-NullFlavor","code":"UNK","display":"Unknown"}},{"url":"text","valueString":"Unknown"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.39128","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-genderIdentity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/gender-identity","code":"male","display":"male"}]}},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.35144","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-birthTime","valueDateTime":"2150-01-01T14:53:00+00:00"}],"identifier":[{"use":"usual","type":{"text":"GA8"},"system":"urn:oid:1.2.840.114350.1.13.876.1.4.8.725198.0","value":"999888777"}],"active":true,"name":[{"use":"official","text":"Baby McBaby","family":"McBaby","given":["Baby"]}],"telecom":[{"system":"phone","value":"404-678-9876","use":"home"}],"gender":"male","birthDate":"2150-01-01","deceasedDateTime":"2152-01-01T00:00:00+00:00","address":[{"use":"home","line":["299 WEST PEACHTREE ROAD NORTHEAST"],"city":"ATLANTA","district":"FULTON","state":"GA","postalCode":"30308","country":"USA"}],"maritalStatus":{"text":"Single"},"multipleBirthInteger":1,"contact":[{"relationship":[{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.4.827665.1000","code":"8","display":"Mother"}]}],"name":{"use":"usual","text":"Mother McMother"}}],"communication":[{"language":{"coding":[{"system":"urn:ietf:bcp:47","code":"es","display":"Spanish"}]},"preferred":true}]}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"2348ddcd-07d7-4f70-b565-5b76df008355"},{"name":"patientId","valueString":"625747"},{"name":"jobPackage","valueString":"SETNETInfantFollowUp"},{"name":"jobStartDateTime","valueDateTime":"2024-04-02T15:49:46+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"919230eb-1321-452f-97a0-4e7f0f2b3152"}},{"item":{"display":"9471fa2b-8473-418f-8382-edb573443e64"}},{"item":{"display":"29475492-d1fb-4a2e-a920-2d5e1b226414"}},{"item":{"display":"e6bfa15a-4658-4a34-b6f6-c0d42b1568ee"}},{"item":{"display":"4dfcfea8-9cc3-49a6-a1c0-42084aa18499"}},{"item":{"display":"809b6acc-3ddc-4ff7-b17a-49f8e291aac5"}},{"item":{"display":"5dd4f1fb-3bc9-48e1-8eb1-21a1da679832"}},{"item":{"display":"06e96068-cf85-4ba8-a52c-6cb027111c6c"}},{"item":{"display":"190fcc49-ae8d-4d70-9bb4-13d8b75ccc91"}},{"item":{"display":"687e0cd4-d3c8-41ed-836e-d239e21c63a8"}},{"item":{"display":"f4349a4b-2e52-4344-a18f-581649fc6e2c"}},{"item":{"display":"8e3d7fa4-ec60-4b3e-89e3-d13f6f7b7a09"}},{"item":{"display":"b4a2e286-ef52-4821-86ac-8c79473bb3a9"}},{"item":{"display":"3d9ba5c3-71ca-4c8b-951d-4d5702a73026"}},{"item":{"display":"f78a5f86-d4f4-4155-9382-d44b97da9310"}},{"item":{"display":"686779da-82a4-463a-b55d-cb60bbe31eb1"}},{"item":{"display":"3ae740bd-0e94-4c6b-ad0b-df6fd4eedc0f"}},{"item":{"display":"419857c6-8c74-42c4-a1f0-5f94b7d0b8dc"}},{"item":{"display":"30d72518-78ef-4c6a-bdb9-f8027a294fff"}},{"item":{"display":"e9e09dcc-f693-4b64-824f-ef4c4615f331"}},{"item":{"display":"d11f2ab8-64bf-4582-adc8-f155a1c041c2"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625747","meta":{"versionId":"1","lastUpdated":"2024-03-05T19:10:25.857000+00:00","source":"#q9nIZIi4tkjANnYw"},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"http://terminology.hl7.org/CodeSystem/v3-NullFlavor","code":"UNK","display":"Unknown"}},{"url":"text","valueString":"Unknown"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.39128","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-genderIdentity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/gender-identity","code":"male","display":"male"}]}},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.35144","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-birthTime","valueDateTime":"2150-01-01T14:53:00+00:00"}],"identifier":[{"use":"usual","type":{"text":"GA8"},"system":"urn:oid:1.2.840.114350.1.13.876.1.4.8.725198.0","value":"999888777"}],"active":true,"name":[{"use":"official","text":"Baby McBaby","family":"McBaby","given":["Baby"]}],"telecom":[{"system":"phone","value":"404-678-9876","use":"home"}],"gender":"male","birthDate":"2150-01-01","deceasedDateTime":"2152-01-01T00:00:00+00:00","address":[{"use":"home","line":["299 WEST PEACHTREE ROAD NORTHEAST"],"city":"ATLANTA","district":"FULTON","state":"GA","postalCode":"30308","country":"USA"}],"maritalStatus":{"text":"Single"},"multipleBirthInteger":1,"contact":[{"relationship":[{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.4.827665.1000","code":"8","display":"Mother"}]}],"name":{"use":"usual","text":"Mother McMother"}}],"communication":[{"language":{"coding":[{"system":"urn:ietf:bcp:47","code":"es","display":"Spanish"}]},"preferred":true}]}}]},{"resourceType":"Parameters","parameter":[{"name":"batchId","valueString":"2b3a2b63-b8f6-49d3-88db-a8b8692eb4b1"},{"name":"patientId","valueString":"625747"},{"name":"jobPackage","valueString":"SETNETInfantFollowUp"},{"name":"jobStartDateTime","valueDateTime":"2024-04-02T15:51:52+00:00"},{"name":"childJobs","resource":{"resourceType":"List","status":"current","mode":"working","entry":[{"item":{"display":"c616fb1a-edd5-4cbb-ae06-b324e0f1cc3b"}},{"item":{"display":"93fc5e89-aca6-4145-b634-c813c6ff11ae"}},{"item":{"display":"4d555859-472b-4483-9f8f-24093bff8f0c"}},{"item":{"display":"8bc202f8-a255-4685-9951-48ab48e0cecc"}},{"item":{"display":"e679fa33-5c65-4b9d-bc34-e39830a8ee0b"}},{"item":{"display":"ede8279a-0554-4b0a-929b-d60b94bf724e"}},{"item":{"display":"08ee9377-fb9d-4758-beb3-e61c90f23fb8"}},{"item":{"display":"03db088f-4320-4847-b61f-1ac7e72df26f"}},{"item":{"display":"1d39ba25-76e3-40e9-a4cd-7ddbb55906a1"}},{"item":{"display":"1c46887c-675c-4d12-95da-38d61c5bf601"}},{"item":{"display":"6e9ddf55-4fda-4bd3-bc98-b2d872d0d095"}},{"item":{"display":"8a649a72-c99e-4a74-9c38-066a9be7ff1e"}},{"item":{"display":"bb517b50-1c6c-4ca9-91d8-557c223dd0c9"}},{"item":{"display":"1682c2ab-bd2d-4c19-9a95-cc7e1c5f4904"}},{"item":{"display":"66bb0533-d5b5-47a5-a2ca-d8388669c8b2"}},{"item":{"display":"f34e6109-0ad6-446a-acc6-a82a388c789d"}},{"item":{"display":"100047bd-57dd-4cd1-9e6a-3bc95377d64c"}},{"item":{"display":"7a90ef3c-a7d5-4187-b95d-44ccf11c233e"}},{"item":{"display":"52476717-b032-43bd-b605-663a0f6d07e3"}},{"item":{"display":"084f4cf0-0dee-42d4-a14e-643a37e460a0"}},{"item":{"display":"f93076d5-b910-471a-9975-f9f93c9e1685"}}]}},{"name":"patientResource","resource":{"resourceType":"Patient","id":"625747","meta":{"versionId":"1","lastUpdated":"2024-03-05T19:10:25.857000+00:00","source":"#q9nIZIi4tkjANnYw"},"extension":[{"extension":[{"url":"ombCategory","valueCoding":{"system":"http://terminology.hl7.org/CodeSystem/v3-NullFlavor","code":"UNK","display":"Unknown"}},{"url":"text","valueString":"Unknown"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"},{"extension":[{"url":"ombCategory","valueCoding":{"system":"urn:oid:2.16.840.1.113883.6.238","code":"2135-2","display":"Hispanic or Latino"}},{"url":"text","valueString":"Hispanic or Latino"}],"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.39128","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-genderIdentity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/gender-identity","code":"male","display":"male"}]}},{"url":"http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use","valueCodeableConcept":{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.10.698084.130.768080.35144","code":"male","display":"male"}]}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-birthTime","valueDateTime":"2150-01-01T14:53:00+00:00"}],"identifier":[{"use":"usual","type":{"text":"GA8"},"system":"urn:oid:1.2.840.114350.1.13.876.1.4.8.725198.0","value":"999888777"}],"active":true,"name":[{"use":"official","text":"Baby McBaby","family":"McBaby","given":["Baby"]}],"telecom":[{"system":"phone","value":"404-678-9876","use":"home"}],"gender":"male","birthDate":"2150-01-01","deceasedDateTime":"2152-01-01T00:00:00+00:00","address":[{"use":"home","line":["299 WEST PEACHTREE ROAD NORTHEAST"],"city":"ATLANTA","district":"FULTON","state":"GA","postalCode":"30308","country":"USA"}],"maritalStatus":{"text":"Single"},"multipleBirthInteger":1,"contact":[{"relationship":[{"coding":[{"system":"urn:oid:1.2.840.114350.1.13.244.2.7.4.827665.1000","code":"8","display":"Mother"}]}],"name":{"use":"usual","text":"Mother McMother"}}],"communication":[{"language":{"coding":[{"system":"urn:ietf:bcp:47","code":"es","display":"Spanish"}]},"preferred":true}]}}]}]
    const mockData$ = of(mockData).pipe(
      map((response: any) => {
        let activeJobList: ActiveFormSummary[] = [];
        response.forEach((parametersResource: Parameters) => {
          // TODO: Fetch Patient, need to setup as merge map? What is the right approach here? @Plamen
          activeJobList.push(new ActiveFormSummary(parametersResource));
        });
        return activeJobList;
      })
    )
    return mockData$;
  }

  getBatchJob(id: string) {
    return this.http.get(this.configService.config.rcApiUrl + this.getBatchJobsEndpoint + `/${id}?include_patient=True`)
  }
}
