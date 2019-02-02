import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  playBook($selected){
    console.log($selected);
    
    const httpOptions = {
      headers: new HttpHeaders({
      'Authorization': 'Bearer FD7GaHNEYg7yfLJpZTyXcJp0vpK5Nw'
      })
    };
    var body = {

    };
    return this.http.post("https://192.168.0.39/api/v2/job_templates/7/launch?bearer_token=FD7GaHNEYg7yfLJpZTyXcJp0vpK5Nw",null);
  }
}
