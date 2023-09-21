import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from './authentication.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { authguardGuard } from '../guards/authguard.guard';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

const routes: Routes = [
  // {path: 'login', redirectTo: '' , pathMatch: 'full'},
  {path: 'login',component: AuthenticationComponent, canActivate: [authguardGuard], data: {role: 'authenticate'}},
  {path: '', component: AuthenticationComponent, canActivate: [authguardGuard], data: {role: 'authenticate'}},
  {path: 'signup', component: SignupComponent, canActivate: [authguardGuard], data: {role: 'authenticate'}}
];


@NgModule({
  declarations: [
    AuthenticationComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)],
    FormsModule,
    ReactiveFormsModule,
    GoogleSigninButtonModule
  ]
})
export class AuthenticationModule { }
