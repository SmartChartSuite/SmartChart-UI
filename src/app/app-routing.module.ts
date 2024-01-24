import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ContentRootComponent} from "./components/content-root/content-root.component";
import {CallbackComponent} from "./components/callback/callback.component";
import {LoginComponent} from "./components/login/login.component";

const routes: Routes = [
  {
    path: '',
    component: ContentRootComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
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
