import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'node_modules/rxjs';
import { DataService } from '../data.service';
import { selectedData } from '../selectedData';
import * as d3 from 'd3';

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

interface OutputType {
  name: string;
  unreachable: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class HomeComponent implements OnInit {
  static noticeSuccess: boolean = false;

  closeAlert() {
    this.showNotice = false;
  }

  devices: Object[] = [];

  commands: Object;

  devicesInit: Object[] = [];

  versionsList: Version[] = [];

  versionSelectBool = false;

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
  }

  init2() {
    this.subscription = this.data.getCachedDevices().subscribe(data => {

      this.devices = [
        "All_Devices",
        "All_Switches",
        "All_Routers"
      ];

      this.commands = [
        { placeholder: "Backup config", name: "backupDevice" },
        { placeholder: "Restore config", name: "restoreDevice" },
        { placeholder: "Delete config", name: "deleteDevice" },
        { placeholder: "Shutdown unused interfaces", name: "unusedInterfaces" }
      ];

      this.selected.device = "All_Devices";
      this.selected.command = "backupDevice";

      var svg = d3.select('svg');
      svg.selectAll("*").remove();
      const width = +svg.attr('width');
      const height = +svg.attr('height');

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1))
        .force('charge', d3.forceManyBody().strength(-2000))
        .force("center", d3.forceCenter(width / 4, height / 2));

      const nodes: Node[] = [];
      const links: Link[] = [];

      data.nodes.forEach((d) => {
        nodes.push(<Node>d);
        this.devices.push(<Node>d.id)
      });

      data.links.forEach((d) => {
        links.push(<Link>d);
      });

      const graph: Graph = <Graph>{ nodes, links };

      const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter()
        .insert("line", "nodes")
        .attr("class", "link")
        .attr('stroke-width', 3);

      const edgepaths = svg.selectAll(".edgepath")
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
        .attr('xlink:href', function (d, i) { return '#edgepath' + i })
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
        .attr('fill', (d: any) => color(d.group))

      const label = svg.selectAll('.text')
        .data(nodes)
        .enter()
        .append("text")
        .text(function (d: any) { return d.id; })
        .style("text-anchor", "middle")
        .style("fill", 'black')
        .style("font-size", 5);

      simulation
        .nodes(graph.nodes)
        .on('tick', ticked);

      simulation.force<d3.ForceLink<any, any>>('link')
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
          if (d.target.x < d.source.x) {
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
      /* function dragstarted(d) {
        if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) { simulation.alphaTarget(0); }
        d.fx = null;
        d.fy = null;
      } */
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /* clicked(event: any)
  {
    console.log(event)
    
    d3.select(event.target)
    .append('circle')
    .attr('cx',event.pageX)
    .attr('cy',event.pageY)
    .attr('r','30')
    .attr('fill','red')
  } */

  setDevice($device) {
    this.selected.device = $device;
    this.versionSelectCheck();
  }

  setCommand($command) {
    this.selected.command = $command;
    this.versionSelectCheck();
  }

  setVersion($version) {
    this.selected.version = $version;
  }

  btnClick() {
    this.subscription = this.data.runPlaybook(this.selected).subscribe(data => {
      this.proccessResult(data);
    });
  }

  versionSelectCheck() {

    this.versionsList = [];
    this.versionSelectBool = false;

    if (this.selected.command === "restoreDevice") {
      this.subscription = this.data.getVersions(this.selected).subscribe(data => {
        for (let s in data) {

          var formatName: string = data[s].split(`${this.selected.device}~`)[1];

          formatName = formatName.replace('.txt', '');

          const version: Version = <Version>{ placeholder: formatName, name: data[s] };

          this.versionsList.push(version);

          this.versionSelectBool = true;

        }
        if (this.versionsList.length == 0) {
          this.noticeMessage = "Could not find any backups for the selected device. Please select a different device and try again.";
          HomeComponent.noticeSuccess = false;
          this.showNotice = true;
        }
        else {
          HomeComponent.noticeSuccess = false;
          this.selected.version = this.versionsList[0].name;
        }
      });
    }
    else if (this.selected.command === "deleteDevice") {
      this.subscription = this.data.getVersions(this.selected).subscribe(data => {
        for (let s in data) {

          var formatName: string = data[s].split(`${this.selected.device}~`)[1];

          formatName = formatName.replace('.txt', '');

          const version: Version = <Version>{ placeholder: formatName, name: data[s] };

          this.versionsList.push(version);

          this.versionSelectBool = true;

        }
        if (this.versionsList.length == 0) {
          this.noticeMessage = "Could not find any backups for the selected device. Please select a different device and try again.";
          HomeComponent.noticeSuccess = false;
          this.showNotice = true;
        }
        else {
          HomeComponent.noticeSuccess = false;
          this.selected.version = this.versionsList[0].name;
        }
      });
    }
    else {
      this.versionsList = [];
      this.versionSelectBool = false;
    }
  }

  proccessResult(data) {

    var devicesFailed = "";
    var isError: boolean = true;

    var proccessArray = data.text.split('TASK [debug] *******************************************************************')[1].split('\n');

    proccessArray.forEach(function (p) {

      var seperate = p.split(':');

      if (seperate[0] == "fatal") {
        var hostname = seperate[1].split(']')[0].replace('[', '');
        if (devicesFailed == "") {
          devicesFailed = devicesFailed + hostname
        }
        else {
          devicesFailed = devicesFailed + ',' + hostname;
        }
      }

    });

    console.log(proccessArray);

    if (devicesFailed != "") {
      this.noticeMessage = `There was trouble gathering information for ${devicesFailed}. Please fix this before continuing.`
      this.showNotice = true;
    }

    else {
      HomeComponent.noticeSuccess = true;
      isError = false;
    }
    return isError;

    /* var extractResult: string = data.text.split("PLAY RECAP")[1];
    var proccessArray = extractResult.split('\n');
    proccessArray.shift();
    proccessArray.pop();
    proccessArray.pop();
    var finalOutput: OutputType[] = [];
    proccessArray.forEach(function (s) {
      var filtered = s.split('    ').filter(function (output) {
        return output != "";
      });
      var name = filtered[0];
      var ok = Number(filtered[1].split('=')[1]);
      var changed = Number(filtered[2].split('=')[1]);
      var unreachable = Number(filtered[3].split('=')[1]);
      var failed = Number((filtered[4].split('=')[1]).trim());

      finalOutput.push(<OutputType>{ name, unreachable, failed });
    });
    finalOutput.forEach(function (f) {
      if (f.failed > 0 && f.unreachable == 0) {
        HomeComponent.noticeSuccess = false;
        devicesFailed = devicesFailed + ',' + f.name;
      }
      else if (f.unreachable > 0 && f.failed == 0) {
        HomeComponent.noticeSuccess = false;
        devicesUnreachable = devicesUnreachable + ',' + f.name;
      }
      else if (f.unreachable > 0 && f.failed > 0) {
        HomeComponent.noticeSuccess = false;
        devicesUnreachable = devicesUnreachable + ',' + f.name;
        devicesFailed = devicesFailed + ',' + f.name;
      }
      else if (f.unreachable == 0 && f.failed == 0) {
        HomeComponent.noticeSuccess = true;
        isError = false;
      }
    });
    if (isError == true) {
      if (devicesUnreachable == "") {
        this.noticeMessage = `There was an internal error on ${devicesFailed} while running this command. Please fix this before continuing.`
        this.showNotice = true;
      }
      else if (devicesFailed == "") {
        this.noticeMessage = `There was trouble connecting to ${devicesUnreachable} while running this command. Please fix this before continuing.`
        this.showNotice = true;
      }
      else {
        this.noticeMessage = `There was an internal error on ${devicesFailed} and trouble connecting to ${devicesUnreachable} while running this command. Please fix these issues before continuing.`
        this.showNotice = true;
      }
    }
    return isError; */
  }

  refreshDevices() {

    this.loadingBool = true;

    this.subscription = this.data.getNewDevices().subscribe(data => {
      var isError = this.proccessResult(data);
      this.init2();
      if (isError == false) {
        this.discoverResult = "Successfully retreived devices";
        this.discoverSuccessfulBool = true;
        this.showResult = true;
      }
      else {
        this.discoverResult = "Device retrieval unsuccessful";
        this.discoverSuccessfulBool = false;
        this.showResult = true;
      }

      setTimeout(() => {
        this.loadingBool = false;
        this.showResult = false;
        this.discoverSuccessfulBool = false;
        this.discoverResult = "";
      }, 10000);

    });
  }

  toggleBackup() {
    this.subscription = this.data.toggleBackup().subscribe(data => {
      if (data != -1) {
        this.noticeMessage = data.text;
        HomeComponent.noticeSuccess = true;
        this.showNotice = true;
      }
      else {
        this.noticeMessage = "There was an error toggling auto-backup. Please try again.";
        HomeComponent.noticeSuccess = false;
        this.showNotice = true;
      }
    });
  }
}
