import { Routes } from '@angular/router';
import { LandingComponent } from "./components/landing/landing.component";
import { CallbackComponent } from "./components/callback/callback.component";
import { LoginComponent } from "./components/login/login.component";
import { FormManagerComponent } from "./components/form-manager/form-manager.component";
import { FormViewerComponent } from "./components/form-viewer/form-viewer.component";
import {JobsFormsGridComponent} from "./components/jobs-forms-grid/jobs-forms-grid.component";
import {AuthGuard} from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'forms',
    component: FormManagerComponent,
    canActivate: [AuthGuard]
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
    path: 'form-viewer',
    component: FormViewerComponent,
    canActivate: [AuthGuard]
  },
  // Wildcard route - MUST be last!
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
