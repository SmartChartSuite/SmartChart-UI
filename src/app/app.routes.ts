import { Routes } from '@angular/router';
import { LandingComponent } from "./components/landing/landing.component";
import { CallbackComponent } from "./components/callback/callback.component";
import { LoginComponent } from "./components/login/login.component";
import { FormManagerComponent } from "./components/form-manager/form-manager.component";
import { FormViewerComponent } from "./components/form-viewer/form-viewer.component";
import {FormSummaryComponent} from "./components/form-summary/form-summary.component";

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
    path: 'summary',
    component: FormSummaryComponent,
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
  }
];
