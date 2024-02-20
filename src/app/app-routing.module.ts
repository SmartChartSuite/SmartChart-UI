import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LandingComponent} from "./components/landing/landing.component";
import {CallbackComponent} from "./components/callback/callback.component";
import {LoginComponent} from "./components/login/login.component";
import {FormsComponent} from "./components/forms/forms.component";
import {JobsComponent} from "./components/jobs/jobs.component";
import {RcApiTestComponent} from "./components/TEMPORARY/rc-api-test-component/rc-api-test-component.component";
import {AuthGuard} from "./guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'forms',
    component: FormsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'jobs',
    component: JobsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'callback',
    component: CallbackComponent,
    canActivate: [AuthGuard]
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
