import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LandingComponent} from "./components/landing/landing.component";
import {CallbackComponent} from "./components/callback/callback.component";
import {LoginComponent} from "./components/login/login.component";
import {FormManagerComponent} from "./components/form-manager/form-manager.component";
import {JobsComponent} from "./components/jobs/jobs.component";
import {FormViewerComponent} from "./components/form-viewer/form-viewer.component";

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'forms',
    component: FormManagerComponent,
  },
  {
    path: 'jobs',
    component: JobsComponent,
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
    path: 'form-viewer/:formName',
    component: FormViewerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
