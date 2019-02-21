import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Playbook } from '../playbook';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  response: Object;
  //h1Style: boolean = false;

  devices: Object;

  commands: Object;

  selected: Playbook; 

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

    this.commands = [
      { placeholder: "Backup config", name: "backupDevice"},
      { placeholder: "Restore config", name: "restoreDevice"},
      { placeholder: "Ospf", name: "ospf"}
    ];

  }

  setCommand($command)
  {
    this.selected.command = $command;
  }

  setDevice($device)
  {
    this.selected.device = $device;
  }

  btnClick() {
    /* this.h1Style = true;
    console.log("clicked"); setting bool and logging to console */

    this.data.playBook(this.selected).subscribe(data => {
      this.response = data
      
    });

  }
}
