import { Routes } from '@angular/router';
import { LandingComponent } from "./components/landing/landing.component";
import { CallbackComponent } from "./components/callback/callback.component";
import { LoginComponent } from "./components/login/login.component";
import { FormManagerComponent } from "./components/form-manager/form-manager.component";
import { FormViewerComponent } from "./components/form-viewer/form-viewer.component";
import { FormsJobsGridComponent } from "./components/form-summary/forms-jobs-grid.component";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  // Public routes - no authentication required
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },

  // Protected routes - authentication required
  {
    path: 'forms',
    component: FormManagerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'forms-jobs',
    component: FormsJobsGridComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'form-viewer',
    component: FormViewerComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard route - redirect to root for non-existing paths
  {
    path: '**',
    redirectTo: ''
  }
];
