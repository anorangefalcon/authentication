import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

const routes: Routes = [
  {path: '', loadChildren: ()=> import('./authentication/authentication.module')
  .then(m => m.AuthenticationModule)},
  {path: 'dashboard', loadChildren: ()=> import('./dashboard/dashboard.module')
  .then(m => m.DashboardModule)},
  {path: 'navbar', component: NavbarComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
