import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private apiService: ApiService, private router: Router) { }
  logout() {
   this.apiService.logout();
   this.router.navigate(['/']);
  }
}
