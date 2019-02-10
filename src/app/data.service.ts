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
    return this.http.post<Playbook>('http://192.168.0.251:3000/api/', playbook);
  }

  playBook($selected){
    var selectedItem = new Playbook();
    selectedItem.name = $selected.name;

    return this.runPlaybook(selectedItem);
  }
}
