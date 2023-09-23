import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent {
  constructor(private router: Router, private apiService: ApiService) { }

  user: any = {};
  loading: boolean = false;
  passwordMatched: any = 'random';
  resetToken: string = '';
  errorText = '';

  newPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  ngOnInit(): void {
    this.resetToken = this.router.url.split('/')[2];
    console.log(this.resetToken);

    this.apiService.fetchUserData({ resetToken: this.resetToken }).subscribe(
      (response) => {
      this.user.email = response.user.email;
      this.user.image = response.user.userDetails.basic.image;
      console.log(this.user);
    },
    (error) => {
      console.log(error.error.message);
      this.router.navigate(['/']);
    });
  }

  changePassword() {
    this.loading = true;
    if (this.newPasswordForm.value.password !== this.newPasswordForm.value.confirmPassword) {
      this.passwordMatched = false;
      this.loading = false;
      return;
    }

    this.apiService.updatePassword({
      password: this.newPasswordForm.get('password')?.value,
      resetToken: this.resetToken
    }).subscribe(
      (response: any) => {
      if (response.passwordReset) {
        this.router.navigate(['/']);
        return;
      }
    },
    (error)=>{
      this.errorText = error.error.message;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
    )};
}
