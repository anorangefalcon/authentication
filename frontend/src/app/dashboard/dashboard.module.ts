import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details/details.component';
import { UsersComponent } from './users/users.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { authguardGuard } from '../guards/authguard.guard';
import { NavbarComponent } from '../navbar/navbar.component';
// import { ControlsComponent } from '../controls/controls.component';

const routes: Routes = [
  {path: '', component: DetailsComponent, canActivate: [authguardGuard], data: {role: 'basic'}},
  {path: 'edit/:userEmail', component: DetailsComponent, canActivate: [authguardGuard], data: {role: 'admin'}},
  {path: 'users', component: UsersComponent, canActivate: [authguardGuard], data: {role: 'admin'}}
]

@NgModule({
  declarations: [
    DetailsComponent,
    UsersComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)],
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DashboardModule { }
