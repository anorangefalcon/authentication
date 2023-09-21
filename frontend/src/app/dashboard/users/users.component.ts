import { Component } from '@angular/core';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  req: any = {
    email: this.apiService.getLoggedInUser()
  };
  searchText: string = '';
  searchTextSubject = new Subject<string>();

  showAdminBool: boolean = false;
  sortBy: string = 'createdAt';
  params: any = {};
  limit: number = 3;
  page: number = 1;
  totalPages: number = 0;
  totalEntries: number = 0;

  constructor(private apiService: ApiService) { }

  table: any = {
    headers: [],
    data: []
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(params: any = {}) {
    let user = null;
    this.params.limit = this.limit;
    this.params.page = this.page;

    const temp = sessionStorage.getItem('user');
    if (temp !== null) {
      user = JSON.parse(temp);
    }

    this.apiService.fetchAllUsers(user, params).subscribe({next: (data) => {
      console.log(data, 'data');

      this.totalEntries = data.total;
      this.totalPages = Math.ceil(data.total / this.limit);
      this.setData(data);
    },
    error: (err:any) => {
      console.log(err.status);
      this.apiService.logout();
    }
    });
  }

  deleteUser(email: string): void {
    this.req.user = email;

    this.apiService.deleteUser(this.req).subscribe({
      next:(data) => {
      console.log(data);
    },
    error: (err:any) => {
      console.log(err.status);
      this.apiService.logout();
    }
  });

    this.fetchUsers(this.params);
  }

  onSearchTextChanged(): void {
    this.searchTextSubject.next(this.searchText);
  }

  search(): void {

    this.searchTextSubject
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((text: string) => {
      this.params.search = text;
      this.apiService.fetchAllUsers(this.req, this.params).subscribe({
        next: (data) => {
          this.setData(data);
        },
        error: (err: any) => {
          console.log(err.status);
          this.apiService.logout();
        }
      });
    });
  }

  // pagination:
  pagination(): void {
    this.fetchUsers(this.params);
  }

  filter(): void {
    this.params.type = this.showAdminBool ? 'admin' : 'user';
    this.params.sortBy = this.sortBy;
    this.fetchUsers(this.params);
  }

  setData(data: any): void {

    this.table.data = ['No Data Found'];

    if (data.users.length === 0) {
      return;
    }
    const cleanData = data.users?.map((item: any) => {
      return {
        name: item.userDetails?.basic?.name,
        email: item.email,
        mobile: item.userDetails?.basic?.mobile,
        gender: item.userDetails?.basic?.gender,

        // arrays:
        education: item.userDetails?.education?.map((item: any) => {
          return {
            degree: item.degree,
            institution: item.institution,
            from: item.year.from,
            to: item.year.to,
          }
        }),
        experience: item.userDetails?.experience?.map((item: any) => {
          return {
            company: item.company,
            designation: item.designation,
            from: item.year.from,
            to: item.year.to,
          }
        }),
      }
    });

    this.table.headers = Object.keys(cleanData[0]);
    this.table.data = cleanData;
  }


}
