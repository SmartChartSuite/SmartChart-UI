import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ContentRootComponent} from "./components/content-root/content-root.component";
import {CallbackComponent} from "./components/callback/callback.component";
import {LoginComponent} from "./components/login/login.component";
import {PatientExplorerComponent} from "./components/patient-explorer/patient-explorer.component";
import {JobsComponent} from "./components/jobs/jobs.component";
import {RcApiTestComponent} from "./TEMPORARY/rc-api-test-component/rc-api-test-component.component";

const routes: Routes = [
  {
    path: '',
    component: ContentRootComponent
  },
  {
    path: 'jobs',
    component: JobsComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'patient',
    component: PatientExplorerComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { // TODO: Delete
    path: 'rcapitest',
    component: RcApiTestComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
