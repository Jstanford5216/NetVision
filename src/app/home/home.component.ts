import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  response: Object;
  //h1Style: boolean = false;

  devices: object;

  constructor(private data: DataService) { }

  ngOnInit() {
    //When component loads
    this.devices = [
      { placeholder: "All routers", name: "routers" },
      { placeholder: "Router 1", name: "router01" },
      { placeholder: "Router 2", name: "router02" },
      { placeholder: "All switches", name: "switches" },
      { placeholder: "Switch 1", name: "switch01" },
      { placeholder: "Switch 2", name: "switch02" }
    ];

  }

  btnClick($selected) {
    /* this.h1Style = true;
    console.log("clicked"); setting bool and logging to console */

    this.data.playBook($selected).subscribe(data => {
      this.response = data
      
    });

  }
}
