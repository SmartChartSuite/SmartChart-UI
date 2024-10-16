import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from "./components/login/login.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfigService} from "./services/config/config.service";
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {StateManagementService} from "./services/state-management/state-management.service";
import {OAuthModule} from "angular-oauth2-oidc";
import {MatIcon} from "@angular/material/icon";
import {FormManagerComponent} from "./components/form-manager/form-manager.component";
import {PatientSearchComponent} from "./components/form-manager/start-new-form/patient-search/patient-search.component";
import {PatientGroupsComponent} from "./components/form-manager/start-new-form/patient-groups/patient-groups.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {SideNavComponent} from './components/side-nav/side-nav.component';
import {MatError, MatFormField, MatFormFieldModule, MatHint, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput, MatInputModule} from "@angular/material/input";
import {StartNewFormComponent} from './components/form-manager/start-new-form/start-new-form.component';
import {FormSelectionComponent} from './components/form-manager/start-new-form/form-selection/form-selection.component';
import {
  PatientSummaryTableComponent
} from './components/form-manager/start-new-form/patient-summary-table/patient-summary-table.component';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {CallbackComponent} from "./components/callback/callback.component";
import {LandingComponent} from "./components/landing/landing.component";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatPaginator} from "@angular/material/paginator";
import {ActiveFormsComponent} from "./components/form-manager/active-forms/active-forms.component";
import {FormViewerComponent} from "./components/form-viewer/form-viewer.component";
import {MatTooltip} from "@angular/material/tooltip";
import {MatNavList} from "@angular/material/list";
import {MatCheckbox} from "@angular/material/checkbox";
import {
  PatientDetailsComponent
} from './components/form-viewer/patient-details/patient-details.component';
import {HasEvidenceDirective} from "./directives/has-evidence.directive";
import {EvidenceDetailsComponent} from './components/form-viewer/evidence-details/evidence-details.component';
import {MatDialogContent, MatDialogModule} from "@angular/material/dialog";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {
  DocumentViewerModalComponent
} from './components/form-viewer/document-viewer-modal/document-viewer-modal.component';
import {SetEvidenceDirective} from "./directives/set-evidence.directive";
import {Base64stringPipe} from "./pipe/base64string.pipe";
import {
  StructuredResultsDetailsComponent
} from './components/form-viewer/evidence-details/structured-results-details/structured-results-details.component';
import {
  UnstructuredResultsDetailsComponent
} from './components/form-viewer/evidence-details/unstructured-results-details/unstructured-results-details.component';
import {CamelCaseToTitleCasePipe} from "./pipe/camel-case-to-title-case.pipe";
import { LoadingComponent } from './components/loading/loading.component';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {LoggingInterceptor} from "./services/loading/loading.interceptor";
import {ConcatDataToStrPipe} from "./pipe/concat-data-to-str.pipe";
import {SuggestedAnswerFormatterPipe} from "./pipe/suggested-answer-formatter.pipe";
import {MatChip} from "@angular/material/chips";
import {DisplayItemFilterPipe} from "./pipe/display-item-filter.pipe";
import {QuestionnaireIndexDirective} from "./directives/questionnaire-index.directive";
import {SortByDatePipe} from "./pipe/sort-by-date.pipe";
import {MatDivider} from "@angular/material/divider";
import {NgxMatTimepickerModule} from "ngx-mat-timepicker";
import { FhirDateTimeComponent } from './components/fhir-date-time/fhir-date-time.component';
import { ActiveFormsGridComponent } from './components/form-manager/active-forms/active-forms-grid/active-forms-grid.component';
import { ActiveFormsFilterComponent } from './components/form-manager/active-forms/active-forms-filter/active-forms-filter.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {
  EvidenceFilterComponent
} from "./components/form-viewer/evidence-details/evidence-filter/evidence-filter.component";

export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

export const stateFactory = (stateManagementService: StateManagementService) => {
  return () => stateManagementService.initializeState();
};

@NgModule({
  declarations: [
    AppComponent,
    FormManagerComponent,
    PatientSearchComponent,
    PatientGroupsComponent,
    SideNavComponent,
    ActiveFormsComponent,
    StartNewFormComponent,
    FormSelectionComponent,
    PatientSummaryTableComponent,
    LoginComponent,
    CallbackComponent,
    LandingComponent,
    FormViewerComponent,
    PatientDetailsComponent,
    EvidenceDetailsComponent,
    DocumentViewerModalComponent,
    StructuredResultsDetailsComponent,
    UnstructuredResultsDetailsComponent,
    LoadingComponent,
    FhirDateTimeComponent,
    ActiveFormsGridComponent,
    ActiveFormsFilterComponent,
    EvidenceFilterComponent
  ],
  imports: [
    NgxMatTimepickerModule,
    OAuthModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
    MatRadioGroup,
    MatRadioButton,
    FormsModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatNoDataRow,
    MatSort,
    ReactiveFormsModule,
    MatError,
    MatDatepicker,
    MatDatepickerInput,
    MatNativeDateModule,
    MatDatepickerToggle,
    MatHint,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    MatCardModule,
    MatPaginator,
    MatTooltip,
    MatNavList,
    MatCheckbox,
    HasEvidenceDirective,
    MatDialogContent,
    ClipboardModule,
    MatDialogModule,
    SetEvidenceDirective,
    HasEvidenceDirective,
    Base64stringPipe,
    CamelCaseToTitleCasePipe,
    MatIconButton,
    MatProgressSpinner,
    ConcatDataToStrPipe,
    SuggestedAnswerFormatterPipe,
    MatChip,
    QuestionnaireIndexDirective,
    DisplayItemFilterPipe,
    SortByDatePipe,
    MatDivider,
    MatExpansionModule
  ],
  providers: [
    SortByDatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: stateFactory,
      deps: [StateManagementService],
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public configService: ConfigService) {
  }
}
