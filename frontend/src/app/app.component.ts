import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private cookieService: CookieService, private apiService: ApiService) { }

  ngOnInit(): void {
    const token = this.cookieService.get('token');
    
    if(token){
      this.apiService.apiLogin().subscribe({
        next: (res:any) => {
        sessionStorage.setItem('user', JSON.stringify(res.body));
        },
        error: (err:any) => {
          this.apiService.logout();
        }
      });
    }
    else{
      this.apiService.logout();
    }
  }
}
