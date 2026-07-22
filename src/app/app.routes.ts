import { Routes } from '@angular/router';
import { LandingComponent } from "./components/landing/landing.component";
import { CallbackComponent } from "./components/callback/callback.component";
import { LoginComponent } from "./components/login/login.component";
import { FormManagerComponent } from "./components/form-manager/form-manager.component";
import { FormViewerComponent } from "./components/form-viewer/form-viewer.component";
import {FormsJobsGridComponent} from "./components/form-summary/forms-jobs-grid.component";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'forms',
    component: FormManagerComponent,
  },
  {
    path: 'forms-jobs',
    component: FormsJobsGridComponent,
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
    path: 'form-viewer',
    component: FormViewerComponent
  },
  // Wildcard route - redirect to root for non-existing paths
  {
    path: '**',
    redirectTo: ''
  }
];
