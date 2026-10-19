import { Routes } from '@angular/router';
import { LandingComponent } from "./components/landing/landing.component";
import { CallbackComponent } from "./components/callback/callback.component";
import { LoginComponent } from "./components/login/login.component";
import { FormViewerComponent } from "./components/form-viewer/form-viewer.component";
import {JobsFormsGridComponent} from "./components/jobs-forms-grid/jobs-forms-grid.component";
import {AuthGuard} from "./guards/auth.guard";
import {unsavedChangesGuard} from "./guards/unsaved-changes.guard";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'jobs-forms',
    component: JobsFormsGridComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    // Form viewer loaded directly from route params. All jobs have a saved
    // QuestionnaireResponse, so every segment is required.
    path: 'form-viewer/:batchId/:patientId/:formName/:questionnaireResponseId',
    component: FormViewerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [unsavedChangesGuard]
  },
  // Wildcard route - MUST be last!
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
