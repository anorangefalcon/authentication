import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  token: any = '';

  constructor(private cookieService: CookieService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.token = this.cookieService.get('token');
    console.log('intercepted', this.token);
    
    if (this.token) {
      request = request.clone({
        setHeaders: {
          Authorization: this.token
        }
      });
    }
    
    return next.handle(request);
  }
}
