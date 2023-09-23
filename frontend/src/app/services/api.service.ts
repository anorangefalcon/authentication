import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  email: string = '';
  provider: string = '';


  constructor(private http: HttpClient, private cookieService: CookieService,
    private authService: SocialAuthService, private router: Router) {}

  getLoggedInUser(): void {
    let loggedInUser: any = null;
    const temp = sessionStorage.getItem('user');
    if (temp !== null) {
      loggedInUser = JSON.parse(temp);
    }
    return loggedInUser.email;
  }

  apiAuthenticate(req: any): Observable<any> {
    this.email = req.email || '';
    return this.http.post('http://localhost:5500/', req);
  }

  apiLogin(req: any = null): Observable<any> {
    if (req === null) {
      return this.http.get('http://localhost:5500/login', { observe: 'response' });
    }
    return this.http.post('http://localhost:5500/login', req, { observe: 'response' });
  }

  apiSignup(req: any): Observable<any> {
    return this.http.post('http://localhost:5500/signup', req, { observe: 'response' });
  }

  fetchUserData(req: any = ''): Observable<any> {
    let user: any = null;

    if (req !== '') {
      user = req;
    }
    else {
      const temp = sessionStorage.getItem('user');
      if (temp !== null) {
        user = JSON.parse(temp);
      }
    }
    return this.http.post('http://localhost:5500/fetchUserDetails', user)
  }

  updateUserData(req: any, admin: any = ''): Observable<any> {
    let user = null;
    const temp = sessionStorage.getItem('user');
    if (temp !== null) {
      user = JSON.parse(temp);
    }
    console.log(req, 'before');

    req.email = user.email;
    console.log(req, 'after');


    return this.http.post('http://localhost:5500/updateUserDetails', req);
  }

  forgotPassword(req: any): Observable<any> {
    return this.http.post('http://localhost:5500/forgotPassword', req);
  }

  updatePassword(req:any): Observable<any> {
    return this.http.post('http://localhost:5500/updatePassword', req);
  }

  fetchAllUsers(req: any, parameter?: any): Observable<any> {
    const URL = 'http://localhost:5500/fetchAllUsers';
    let params = new HttpParams();

    if (parameter) {
      for (let key of Object.keys(parameter)) {
        params = params.set(key, parameter[key]);
      }
      if (!(parameter.search)) {
        params = params.set('search', '');
      }
    }
    return this.http.post(URL, req, { params });
  }

  deleteUser(req: any): Observable<any> {
    return this.http.post('http://localhost:5500/deleteUser', req);
  }

  setTokenCookie(token: string): void {
    this.cookieService.set('token', token);
  }

  logout() {
    sessionStorage.removeItem('user');
    this.cookieService.delete('token');
    // window.location.reload();
  }

  
}
