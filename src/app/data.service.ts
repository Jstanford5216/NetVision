import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { selectedData } from './selectedData';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) { }

  runPlaybook(data: selectedData): Observable<object> {
    return this.http.post<selectedData>('http://10.0.0.4:3000/api/', data);
  }
  
  getVersions(data: selectedData): Observable<object> {
    return this.http.get('http://10.0.0.4:3000/api/' + data.device);
  }

  getDevices(): Observable<any> {
    return this.http.get('http://10.0.0.4:3000/api/' + 'devices');
  }
}
