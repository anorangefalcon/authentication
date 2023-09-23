import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CookieService } from 'ngx-cookie-service';

export const authguardGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService);

  const user: any = sessionStorage.getItem('user') || null;
  const loggedIn: boolean = (cookie.get('token'))? true : false;

  let _router = inject(Router);
  let _apiService = inject(ApiService);
  
  if (user === null && route.data['role'] !== 'authenticate') {
    if(route.data['role'] === 'signup' && _apiService.email !== ''){
      return true;
    }
    _router.navigate(['/']);
    return false;
  }

  if (loggedIn){
    if(((route.data['role'] === 'signup') ||  (route.data['role'] === 'authenticate')) && user !== null){
      _router.navigate(['/dashboard']);
      return false;
    }
  
    if (user !== null && route.data['role'] === 'authenticate') {
      _router.navigate(['/dashboard']);
      return false;
    }
  
    if(route.data['role'] === 'admin' && user !== null){
      if(JSON.parse(user).type === 'admin'){
        return true;
      }
      _router.navigate(['/dashboard']);
      return false;
    }
  }
  
  return true;
};

