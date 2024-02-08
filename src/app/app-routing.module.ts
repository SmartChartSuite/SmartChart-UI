import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ContentRootComponent} from "./components/content-root/content-root.component";
import {CallbackComponent} from "./components/callback/callback.component";
import {LoginComponent} from "./components/login/login.component";
import {PatientExplorerComponent} from "./components/patient-explorer/patient-explorer.component";
import {ActiveJobsComponent} from "./components/active-jobs/active-jobs.component";

const routes: Routes = [
  {
    path: '',
    component: ContentRootComponent
  },
  {
    path: '',
    component: ContentRootComponent
  },
  {
    path: 'patient',
    component: PatientExplorerComponent
  },
  {
    path: 'active-jobs',
    component: ActiveJobsComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
