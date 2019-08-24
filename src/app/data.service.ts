import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { selectedData } from './selectedData';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) { } //Initalise Http client

  serverAddress = 'IP Address Here:3000'; //Localised Ip for easy ammending

  runPlaybook(data: selectedData): Observable<any> { //Send requests to API as object or any and return as promises
    return this.http.post<selectedData>(`http://${this.serverAddress}/api/`, data,{observe:'response'});
  }

  getVersions(data: selectedData): Observable<object> {
    return this.http.get(`http://${this.serverAddress}/api/` + data.device);
  }

  getCachedDevices(): Observable<any> {
    return this.http.get(`http://${this.serverAddress}/api/` + 'CachedDevices');
  }

  getNewDevices(): Observable<any> {
    return this.http.get(`http://${this.serverAddress}/api/` + 'NewDevices');
  }

  toggleBackup(): Observable<any> {
    return this.http.get(`http://${this.serverAddress}/api/` + 'toggleAutoBackup');
  }
}
