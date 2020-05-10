import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionLoginComponent } from './connection-login/connection-login.component';
import { MainContentComponent } from './main-content/main-content.component';
import { SideBarUserConnectedComponent } from './side-bar-user-connected/side-bar-user-connected.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: ConnectionLoginComponent },
  { path: 'undercover', component: MainContentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }