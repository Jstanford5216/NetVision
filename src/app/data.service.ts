import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { selectedData } from './selectedData';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) { }

  serverAddress = '192.168.193.133:3000'; 

  runPlaybook(data: selectedData): Observable<object> {
    return this.http.post<selectedData>(`http://${ this.serverAddress }/api/`, data);
  }
  
  getVersions(data: selectedData): Observable<object> {
    return this.http.get(`http://${ this.serverAddress }/api/` + data.device);
  }

  getCachedDevices(): Observable<any> {
    return this.http.get(`http://${ this.serverAddress }/api/` + 'CachedDevices');
  }

  getNewDevices(): Observable<any> {
    return this.http.get(`http://${ this.serverAddress }/api/` + 'NewDevices');
  }
  
  toggleBackup(): Observable<any> {
    return this.http.get(`http://${ this.serverAddress }/api/` + 'toggleAutoBackup');
  }
}
