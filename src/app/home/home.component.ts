import { Component, OnInit, ViewEncapsulation } from '@angular/core'; //Import list of modules
import { AngularMultiSelect } from 'angular2-multiselect-dropdown';
import * as d3 from 'd3';
import { Subscription } from 'node_modules/rxjs';
import { DataService } from '../data.service';
import { selectedData } from '../selectedData';

interface Node {
  id: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface Graph {
  nodes: Node[];
  links: Link[];
}

interface Version {
  placeholder: string;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class HomeComponent implements OnInit {

  closeAlert() {  //Method to close alert box
    this.showNotice = false;
  }

  //Declare variables 
  noticeSuccess: boolean;
  
  devices: Object[] = []; 

  commands: Object;

  devicesInit: Object[] = [];

  versionsList: Version[] = [];

  settings = {};

  versionSelectBool = false;

  versionRestoreSelectBool = false;

  showNotice = false;

  noticeMessage = "";

  loadingBool = false;

  discoverResult = "";

  showResult = false;

  discoverSuccessfulBool = false;

  NewDeviceInputError = false;

  newDevice: string;

  selected: selectedData = new selectedData();

  subscription: Subscription;

  constructor(private data: DataService) { }

  ngOnInit() {
    //When component loads
    this.init2();
    this.noticeSuccess = false;
  }

  init2() {
    this.subscription = this.data.getCachedDevices().subscribe(data => { //Make request to API to get any previous network map device list

      this.devices = [
        "All_Devices",
        "All_Switches",
        "All_Routers"
      ];

      this.commands = [
        { placeholder: "Backup config", name: "backupDevice" }, //Initalise objects with key paired values to insert into dropdowns
        { placeholder: "Restore config", name: "restoreDevice" },
        { placeholder: "Delete config", name: "deleteDevice" },
        { placeholder: "Shutdown unused interfaces", name: "unusedInterfaces" }
      ];

      this.settings = {
        enableSearchFilter: true,
        labelKey: 'placeholder', //Initalise settings relating to the multi-dropdown plugin using placeholder as display and name as value
        primaryKey: 'name'
      };

      this.selected.device = "All_Devices"; //Set default selected devices
      this.selected.command = "backupDevice";
      
      d3.selectAll('g').remove();
      d3.selectAll('path').remove(); //Clear any old maps to make way for a new one
      d3.selectAll('text').remove();
      
      var svg = d3.select('svg');
      const width = +svg.attr('width'); //Initalise width and height of svg bounding box
      const height = +svg.attr('height');

      const color = d3.scaleOrdinal(d3.schemeCategory10); //Set colour category for objects within d3

      const simulation = d3.forceSimulation() //Create an empty simulation with opposing distance to keep nodes separated and aligned to the center of bounding box
        .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1))
        .force('charge', d3.forceManyBody().strength(-2000))
        .force("center", d3.forceCenter(width / 4, height / 2));

      const nodes: Node[] = [];
      const links: Link[] = [];

      data.nodes.forEach((d) => { //For every node in the returned data store it in local node array and append static device list
        nodes.push(<Node>d);
        this.devices.push(<Node>d.id)
      });

      data.links.forEach((d) => { //For every node in the returned data store it in local node array and append static device lis
        links.push(<Link>d);
      });

      const graph: Graph = <Graph>{ nodes, links }; //Append interface arrays to instance of the graph interface

      const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)   //Create new group within svg and insert lines between nodes(devices)
        .enter()
        .insert("line", "nodes")
        .attr("class", "link")
        .attr('stroke-width', 3);

      const edgepaths = svg.selectAll(".edgepath")  //create path above normal path and add labels to ensure they are above the links not on them
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'edgepath')
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('id', function (d, i) { return 'edgepath' + i })
        .style('pointer-events', 'none');

      const edgelabels = svg.selectAll(".edgelabel")
        .data(links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr('class', 'edgelabel')
        .attr('id', function (d, i) { return 'edgelabel' + i })
        .attr('font-size', 10)
        .attr('fill', 'black');

      edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i }) //Ensure the text is placed at the same angle as the lines
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('startOffset', '50%')
        .text(function (d) { return d.label });

      const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter()
        .append('circle')
        .attr('r', 6)
        .attr('fill', (d: any) => color(d.group)) //Create circles based of nodes decided colour from id

      const label = svg.selectAll('.text')
        .data(nodes)
        .enter()
        .append("text")
        .text(function (d: any) { return d.id; }) //Text styling
        .style("text-anchor", "middle")
        .style("fill", 'black')
        .style("font-size", 5);

      simulation
        .nodes(graph.nodes)
        .on('tick', ticked); //When simulation ticks intialise graph based on x y settings below

      simulation.force<d3.ForceLink<any, any>>('link') //Space the nodes out based on force settings
        .links(graph.links);

      function ticked() {
        link
          .attr('x1', function (d: any) { return d.source.x; })
          .attr('y1', function (d: any) { return d.source.y; })
          .attr('x2', function (d: any) { return d.target.x; })
          .attr('y2', function (d: any) { return d.target.y; });

        node
          .attr('cx', function (d: any) { return d.x; })
          .attr('cy', function (d: any) { return d.y; });

        label
          .attr("x", function (d: any) { return d.x; })
          .attr("y", function (d: any) { return d.y; });

        edgepaths.attr('d', function (d: any) {
          return 'M ' + d.source.x + ' ' + (d.source.y - 10) + ' L ' + d.target.x + ' ' + (d.target.y - 10);
        });

        edgelabels.attr('transform', function (d: any) {
          if (d.target.x < d.source.x) { //If the target x is lower down than source x flip the label
            var bbox = this.getBBox();

            var rx = bbox.x + bbox.width / 2; 
            var ry = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + rx + ' ' + (ry + 10) + ')';
          }
          else {
            return 'rotate(0)';
          }
        });
      }

    }, err => {
      this.noticeMessage = "There was trouble connecting to the server. Please try again.";  //If API call fails show error message by setting text and bools
      this.noticeSuccess = false;
      this.showNotice = true;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe(); //When user navigates destroy subscription to avoid memory leaks
  }

  setDevice($device) {
    this.selected.device = $device; //Set selected device from html
    this.versionSelectCheck();
  }

  setCommand($command) {
    this.selected.command = $command; //Set selected command from html
    this.versionSelectCheck();
  }

  btnClick() {
    if (this.selected.command == "deleteDevice") {

      this.subscription = this.data.runPlaybook(this.selected).subscribe(data => { //APi call to retrieve list of backups available for this device
        console.log(data);
        if (data.status == "204") {  //If returned data is not null show success message in the alert diagram.
          this.noticeMessage = "Backup/s deleted successfully!"
          this.noticeSuccess = true;
          this.showNotice = true;
        }
        else {
          this.noticeMessage = "There was trouble removing your backup/s. Please contact your manager."; //If returned data is null show error message in the alert diagram.
          this.noticeSuccess = false;
          this.showNotice = true;
        }
      },
        err => { //If API call failed show error message
          this.noticeMessage = "There was trouble connecting to the server. Please try again.";
          this.noticeSuccess = false;
          this.showNotice = true;
        });
    }
    else if (this.selected.command == "unusedInterfaces")
    {
      this.subscription = this.data.runPlaybook(this.selected).subscribe(data => { //APi call to retrieve list of backups available for this device
        if (data.status == "204") {  //If returned data is not null show success message in the alert diagram.
          this.noticeMessage = "Unused interfaces shutdown successfully!"
          this.noticeSuccess = true;
          this.showNotice = true;
        }
        else {
          this.noticeMessage = "There was trouble shutting down unused interfaces. Please contact your manager."; //If returned data is null show error message in the alert diagram.
          this.noticeSuccess = false;
          this.showNotice = true;
        }
      },
        err => { //If API call failed show error message
          this.noticeMessage = "There was trouble connecting to the server. Please try again.";
          this.noticeSuccess = false;
          this.showNotice = true;
        });
    }
    else { //If it is anything other than delete then pass the selecteddata to the API and proccess the response
      this.subscription = this.data.runPlaybook(this.selected).subscribe(data => {
        if (data.status == "201") {  //If returned data is not null show success message in the alert diagram.
          this.noticeMessage = "Backup or restore completed successfully!";
          this.noticeSuccess = true;
          this.showNotice = true;
        }
        else {
          this.noticeMessage = "There was trouble restoring or backing up your device/s. Please contact your manager."; //If returned data is null show error message in the alert diagram.
          this.noticeSuccess = false;
          this.showNotice = true;
        }
      },
        err => { //If unable to connect to API show error message
          this.noticeMessage = "There was trouble connecting to the server. Please try again.";
          this.noticeSuccess = false;
          this.showNotice = true;
        });
    }
  }

  versionSelectCheck() { //Runs everytime a new device is selected while restore or delete are selected

    this.versionsList = []; //Initalise to blank to avoid duplicates

    if (this.selected.command === "restoreDevice") {

      this.versionSelectBool = false;

      this.subscription = this.data.getVersions(this.selected).subscribe(data => {
        for (let s in data) {

          var formatName: string = data[s].split(`${this.selected.device}~`)[1];

          formatName = formatName.replace('.txt', ''); //For each backup file remove the filename and add to an array of interfaces for easy access on html

          const version: Version = <Version>{ placeholder: formatName, name: data[s] };

          this.versionsList.push(version);
        }

        if (this.versionsList.length == 0) {
          this.noticeMessage = "Could not find any backups for the selected device. Please select a different device and try again."; //No backups found will show error
          this.noticeSuccess = false;
          this.showNotice = true;
        }
        else {
          this.noticeSuccess = true;
          this.selected.version.push(this.versionsList[0].name); //Show successfully gathered backups
          this.versionRestoreSelectBool = true; //Show restore dropdown and hide delete dropdown
        }
      },
        err => { //Server error, show message
          this.noticeMessage = "There was trouble connecting to the server. Please try again.";
          this.noticeSuccess = false;
          this.showNotice = true;
        });
    }
    else if (this.selected.command === "deleteDevice") {

      this.versionRestoreSelectBool = false;

      this.subscription = this.data.getVersions(this.selected).subscribe(data => {
        for (let s in data) {

          var formatName: string = data[s].split(`${this.selected.device}~`)[1];

          formatName = formatName.replace('.txt', '');

          const version: Version = <Version>{ placeholder: formatName, name: data[s] };

          this.versionsList.push(version);
        }

        AngularMultiSelect.prototype.selectedItems = []; //Initalise empty array to start the script

        if (this.versionsList.length == 0) {
          this.noticeMessage = "Could not find any backups for the selected device. Please select a different device and try again."; //Show error if none found.
          this.noticeSuccess = false;
          this.showNotice = true;
        }
        else {
          this.noticeSuccess = true; //Show success as backups were found
          this.selected.version.push(this.versionsList[0].name);
          this.versionSelectBool = true; //Hide the restoredevice dropdown and show the multi-select one.
        }
      },
        err => {
          this.noticeMessage = "There was trouble connecting to the server. Please try again."; //Server error, show message
          this.noticeSuccess = false;
          this.showNotice = true;
        });
    }
    else {
      this.versionsList = []; //For any other commands hide both restore and delete dropdowns
      this.versionSelectBool = false;
      this.versionRestoreSelectBool = false;
    }
  }

  proccessResult(data) {

    var devicesFailed = "";
    var isError: boolean = true; //Initalise varibles to default

    var proccessArray = data.text.split('TASK [debug] *******************************************************************')[1].split('\n'); //Split output after result of execution

    proccessArray.forEach(function (p) {

      var seperate = p.split(':');

      if (seperate[0] == "fatal") {
        var hostname = seperate[1].split(']')[0].replace('[', '');
        if (devicesFailed == "") {
          devicesFailed = devicesFailed + hostname
        }
        else {
          devicesFailed = devicesFailed + ',' + hostname; //Compile list of devices that have failed and add them to a list
        }
      }

    });

    if (devicesFailed != "") {
      this.noticeMessage = `There was trouble gathering information for ${devicesFailed}. Please fix this before continuing.` //If list of failed devices is not blank show error with the list of failed devices
      this.showNotice = true;
    }

    else {
      this.noticeSuccess = true; //No devices failed show success
      isError = false;
    }
    return isError;
  }

  refreshDevices() {

    this.loadingBool = true; //Display loading screen

    this.subscription = this.data.getNewDevices().subscribe(data => { //Call API to gather new devices
      var isError = this.proccessResult(data); //Finds out if any devices encountered an error from other function
      this.init2(); //Re-draw network map
      if (isError == false) { //If there was no errors show success in loading div
        this.discoverResult = "Successfully retreived devices";
        this.discoverSuccessfulBool = true;
        this.showResult = true;
      }
      else {
        this.discoverResult = "Device retrieval unsuccessful"; //Show error in loading div
        this.discoverSuccessfulBool = false;
        this.showResult = true;
      }

      setTimeout(() => { //Close loading screen 10s after displaying message
        this.loadingBool = false;
        this.showResult = false;
        this.discoverSuccessfulBool = false;
        this.discoverResult = "";
      }, 10000);

    },
      err => {
        this.noticeMessage = "There was trouble connecting to the server. Please try again."; //Server error, display message
        this.noticeSuccess = false;
        this.showNotice = true;
      });
  }

  toggleBackup() {
    this.subscription = this.data.toggleBackup().subscribe(data => { //Send API request to toggle backup
      if (data != -1) { //If response is not an error response show success message
        this.noticeMessage = data.text;
        this.noticeSuccess = true;
        this.showNotice = true;
      }
      else {
        this.noticeMessage = "There was an error toggling auto-backup. Please try again."; //Show error if status was -1(failure)
        this.noticeSuccess = false;
        this.showNotice = true;
      }
    },
      err => { //If nop connection can be made at all show error message
        this.noticeMessage = "There was trouble connecting to the server. Please try again.";
        this.noticeSuccess = false;
        this.showNotice = true;
      });
  }
  onItemSelect(item: any) {
    this.selected.version = AngularMultiSelect.prototype.selectedItems;
    console.log(AngularMultiSelect.prototype.selectedItems);
  }
  onItemDeSelect(item: any) {
    this.selected.version = AngularMultiSelect.prototype.selectedItems; //Functions to update my object from the multiselect module
  }

  onSelectAll(items: any) {
    this.selected.version = AngularMultiSelect.prototype.selectedItems;
  }
  onDeSelectAll(items: any) {
    this.selected.version = AngularMultiSelect.prototype.selectedItems;
  }
  onFilterSelectAll() {
    this.selected.version = AngularMultiSelect.prototype.selectedItems;
  }
  onFilterDeSelectAll() {
    this.selected.version = AngularMultiSelect.prototype.selectedItems;
  }

  setRestoreVersion(version){
    var tempArray = [] //Empty array on new values and append to a new array, then set the version list.
    tempArray.push(version);
    this.selected.version = tempArray;
  }

}
