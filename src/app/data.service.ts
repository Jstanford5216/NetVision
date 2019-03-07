import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playbook } from './playbook';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) { }

  runPlaybook(playbook: Playbook): Observable<Playbook> {
    return this.http.post<Playbook>('http://10.0.0.4:3000/api/', playbook);
  }
  
  getVersions(playbook: Playbook): Observable<object> {
    return this.http.get('http://10.0.0.4:3000/api/' + playbook.device);
  }
}
