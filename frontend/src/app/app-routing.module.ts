import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { authguardGuard } from './guards/authguard.guard';

const routes: Routes = [
  {path: '', loadChildren: ()=> import('./authentication/authentication.module')
  .then(m => m.AuthenticationModule)},
  {path: 'dashboard', loadChildren: ()=> import('./dashboard/dashboard.module')
  .then(m => m.DashboardModule)},
  {path: 'changepassword/:resetToken', component: ChangepasswordComponent, canActivate: [authguardGuard], data: {role: 'authenticate'}},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
