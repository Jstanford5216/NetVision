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

  routers: object;

  constructor(private data: DataService) { }

  ngOnInit() {
    //When component loads
    this.routers = [
      { name: "router01", ip: "192.168.128.129" },
      { name: "router02", ip: "192.168.128.131" }
    ]

  }

  btnClick() {
    /* this.h1Style = true;
    console.log("clicked"); setting bool and logging to console */
    this.data.playBook().subscribe(data => {
      this.response = data
      console.log(this.response)
      console.log("Applied")
    });

  }
}
