import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  form: String = 'basicDetails';
  Details!: FormGroup;
  basicDetails!: FormGroup;
  education!: FormGroup;
  experience!: FormGroup;
  updating: Boolean = false;

  imageUrl: String = '';
  imageStatus: Boolean = false;
  loading: Boolean = false;

  constructor(private fb: FormBuilder, private ApiService: ApiService, private route: ActivatedRoute, private imageUploadService: ImageUploadService) {
    this.basicDetails = this.fb.group({
      name: ['', Validators.required],
      image: [''],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      address: this.fb.group({
        city: '',
        state: '',
        country: '',
      })
    });

    this.Details = this.fb.group({
      basicDetails: this.basicDetails,
      education: this.fb.array([]),
      experience: this.fb.array([]),
    });
  }

  getEducation() {
    const eduArr = (<FormArray>this.Details.get('education'))?.controls;
    return eduArr;
  }

  addEdu() {
    const eduArr = (<FormArray>this.Details.get('education'));
    eduArr.push(this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      year: this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required],
      })
    }));
  }

  removeEdu(index: number) {
    const eduArr = (<FormArray>this.Details.get('education'));
    eduArr.removeAt(index);
  }

  getExperience() {
    const expArr = (<FormArray>this.Details.get('experience'))?.controls;
    return expArr;
  }

  addExp() {
    const expArr = (<FormArray>this.Details.get('experience'));
    expArr.push(this.fb.group({
      company: ['', Validators.required],
      designation: ['', Validators.required],
      year: this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required],
      })
    }));
  }

  removeExp(index: number) {
    const expArr = (<FormArray>this.Details.get('experience'));
    expArr.removeAt(index);
  }


  // now let's play with backend:

  ngOnInit(): void {
    // if admins want to edit other users details:
    let req: any = '';
    this.route.params.subscribe((params) => {
      if (params['userEmail']) {
        req = {
          admin: this.ApiService.getLoggedInUser(),
          email: params['userEmail']
        }
      }
    });

    this.ApiService.fetchUserData(req).subscribe((data: any) => {
      console.log(data, 'front mein data');
      
      this.imageUrl = data.user?.userDetails?.basic?.image;
      if (this.imageUrl) this.imageStatus = true;

      this.basicDetails.patchValue({
        email: data.user?.email,
      });
      this.basicDetails.patchValue(data.user?.userDetails?.basic);

      if (!(data.user?.userDetails?.education?.length)) {
        this.addEdu();
      }
      else {
        data.user?.userDetails?.education.forEach((element: any) => {
          (<FormArray>this.Details.get('education')).push(this.fb.group({
            institution: element.institution,
            degree: element.degree,
            year: this.fb.group({
              from: element.year.from,
              to: element.year.to,
            })
          }));
        });
      }

      if (!(data.user?.userDetails?.experience?.length)) {
        this.addExp();
      }
      else {
        data.user?.userDetails?.experience.forEach((element: any) => {
          (<FormArray>this.Details.get('experience')).push(this.fb.group({
            company: element.company,
            designation: element.designation,
            year: this.fb.group({
              from: element.year.from,
              to: element.year.to,
            })
          }));
        });
      }
    });


  }

  updateDetails() {
    this.updating = true;
    this.Details.value.basicDetails.image = this.imageUrl;
    this.ApiService.updateUserData(this.Details.value).subscribe((data: any) => {
      this.updating = false;
    });
  }


  uploadImage(event: any) {
    let file: any | null = (<HTMLInputElement>event.target).files;
    this.loading = true;
    let promise = this.imageUploadService.fileupload(file[0]);
    promise
      .then((response: any) => {
        this.imageUrl = response.url;
        this.imageStatus = true;
        this.loading = false;

        this.basicDetails.get('image')?.patchValue(this.imageUrl);
      })
      .catch(err => console.log(err));
  }

}