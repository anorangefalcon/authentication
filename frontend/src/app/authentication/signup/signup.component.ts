import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit{

  email: string = '';
  constructor(private ApiService: ApiService, private router: Router) { 
    this.email = this.ApiService.email ;
  }
  loading: boolean = false;
  passwordMatched: boolean = true;

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  ngOnInit(): void {
    this.authForm.get('email')?.setValue(this.email);
  }

  register() {
    this.loading = true;
    
    const request:any = {
      email: this.authForm.get('email')?.value,
      password: this.authForm.get('password')?.value,
      confirmPassword: this.authForm.get('confirmPassword')?.value
    }

    if (request.password === request.confirmPassword) {
      this.passwordMatched = true;
      this.ApiService.apiSignup(request).subscribe((response) => {
        console.log(response.body, 'response');
        console.log(response.headers.get('Authorization'));
        
        if (response.headers.get('Authorization')){
          this.loading = false;
          sessionStorage.setItem('user', 
          JSON.stringify({
            email: response.body.email,
            type: response.body.type
          })
          );
          this.ApiService.setTokenCookie(response.headers.get('Authorization'));
          this.router.navigate(['/dashboard']);
        }
        else{
          console.log('unable to generate token');
        }
      });

    }
    else{
      this.passwordMatched = false;
      console.log("Password not matched");
    }
  }
}
