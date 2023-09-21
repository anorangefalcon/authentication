import { Component, OnInit, Renderer2 } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  user: any = null;
  email: string = '';
  inactiveAccount: boolean = false;
  isProviderAccount: string = '';
  request: any = {};
  script: any;
  emailExists: boolean = false;
  loading: boolean = false;
  passwordMatched: any = 'random';

  constructor(private ApiService: ApiService, private router: Router, private location: Location,
    private authService: SocialAuthService, private renderer: Renderer2) {
    this.email = this.ApiService.email;

    window.addEventListener('authCredential', (event: any) => {
      console.log('G-Event', event.detail);
      this.ApiService.apiAuthenticate(event.detail).subscribe((response: any) => {
        console.log(response, 'auth');
        
        if (response.emailExists) {
          if (response.status === 'inactive') {
            this.inactiveAccount = true;
          }
          else {
            this.inactiveAccount = false;
            this.emailExists = true;
            this.user = event.detail;
            this.authenticate();
          }
        }
        else {
          this.ApiService.apiSignup(event.detail).subscribe((response: any) => {
            sessionStorage.setItem('user',
              JSON.stringify({
                email: response.body.email,
                type: response.body.type
              })
            );
            this.ApiService.setTokenCookie(response.headers.get('Authorization'));
            this.ApiService.provider = this.user?.provider || '';
            this.loading = false;
            this.router.navigate(['/dashboard']);
          });
        }
      });
    });
  }

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  ngOnInit(): void {

    // new google auth
    this.script = this.renderer.createElement('script');
    this.script.src = 'https://accounts.google.com/gsi/client';
    this.script.async = true;

    this.renderer.appendChild(document.body, this.script);

 
    // some old google auth
    this.authForm.get('email')?.setValue(this.email);

    this.authService.authState.subscribe((user) => {
      this.authForm.get('email')?.setValue(user?.email);
      this.loading = true;
      this.user = user;

      // if (this.user) {
      //   this.ApiService.apiAuthenticate(this.user).subscribe((response: any) => {
      //     if (response.emailExists) {
      //       if (response.status === 'inactive') {
      //         this.inactiveAccount = true;
      //       }
      //       else {
      //         this.inactiveAccount = false;
      //         this.emailExists = true;
      //         this.authenticate();
      //       }
      //     }
      //     else {
      //       this.ApiService.apiSignup(this.user).subscribe((response: any) => {
      //         sessionStorage.setItem('user',
      //           JSON.stringify({
      //             email: response.body.email,
      //             type: response.body.type
      //           })
      //         );
      //         this.ApiService.setTokenCookie(response.headers.get('Authorization'));
      //         this.ApiService.provider = this.user?.provider || '';
      //         this.loading = false;
      //         this.router.navigate(['/dashboard']);
      //       });
      //     }
      //   });
      // }

    });
  }

 
  loginWithFacebook(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  loginWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  edit() {
    this.emailExists = false;
    this.location.replaceState('/');
  }

  loginViaGoogle() {
    console.log(sessionStorage.getItem('authProvided'));
  }

  authenticate(res: any = '') {
    this.loading = true;
    this.request.email = this.authForm.get('email')?.value;
    this.request.password = this.authForm.get('password')?.value;

    if (this.user) {
      this.request = this.user;
    }

    if (!this.emailExists && this.request.email != '') {
      this.ApiService.apiAuthenticate(this.request).subscribe((response) => {
        if (response.emailExists && response.status === 'inactive') {
          this.inactiveAccount = true;
        }
        else if (response.provider) {
          this.isProviderAccount = response.provider;
        }
        else if (response.emailExists) {
          this.isProviderAccount = '';
          this.location.replaceState('/login')
          this.emailExists = true;
          this.loading = false;
          this.inactiveAccount = false;
        }
        else {
          this.router.navigate(['/signup']);
        }
      });
    }
    else if (this.emailExists) {
      this.ApiService.apiLogin(this.request).subscribe((response) => {

        if (response.body.access && response.headers.get('Authorization')) {
          this.passwordMatched = true;
          this.isProviderAccount = '';

          sessionStorage.setItem('user',
            JSON.stringify({
              email: response.body.email,
              type: response.body.type
            })
          );
          this.ApiService.setTokenCookie(response.headers.get('Authorization'));
          this.ApiService.provider = this.user?.provider || '';
          this.router.navigate(['/dashboard']);
        }
        else if (response.body.access == false) {
          this.passwordMatched = false;
          this.loading = false;
        }
      });

    }
  }

  ngOnDestroy() {
    this.renderer.removeChild(document.body, this.script);
  }
}

