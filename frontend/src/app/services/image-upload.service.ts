import { Injectable } from '@angular/core';
import * as filestack from 'filestack-js';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  constructor() { }

  url = "";
  apiKey = "A5lqbKqchS7KkkhLOMY6ez";
  client = filestack.init(this.apiKey);

  fileupload(file: any) {
    return this.client.upload(file);
  }
}
