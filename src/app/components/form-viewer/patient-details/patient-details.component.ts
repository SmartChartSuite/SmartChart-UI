import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {PatientSummary} from "../../../models/patient-summary";
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {RcApiConfig} from "../../../models/rc-api/rc-api-config";

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss'
})
export class PatientDetailsComponent implements OnInit, OnChanges {
  @Input() patientSummary: PatientSummary;

  identifierLabel: string = "Medical Record Number";
  identifierSystem: string | undefined = undefined;
  identifierValue: string = "Unknown";

  constructor(public rcApiInterface: RcApiInterfaceService) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.rcApiInterface.getConfig().subscribe({
      next: (value: RcApiConfig) => {
        console.log(value);
        if (value?.primaryIdentifier) {
          if (value?.primaryIdentifier?.system) {
            this.identifierSystem = value?.primaryIdentifier?.system;
            if(value?.primaryIdentifier?.label) {
              this.identifierLabel = value?.primaryIdentifier?.label;
            }
            const primaryIdentifier = this.patientSummary?.identifier?.find(identifier => identifier.system === this.identifierSystem);
            this.identifierValue = primaryIdentifier?.value ?? "Unknown";
          }
        }
      }
    })
  }
}
