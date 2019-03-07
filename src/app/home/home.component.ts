import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';
import { Playbook } from '../playbook';
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

const versions: Version[] = [];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class HomeComponent implements OnInit {

  response: Object;
  //h1Style: boolean = false;

  devices: Object;

  commands: Object;

  versionsList: Version[] = [];

  versionSelectBool = false;

  selected: Playbook = new Playbook();

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
      { placeholder: "Backup config", name: "backupDevice" },
      { placeholder: "Restore config", name: "restoreDevice" },
    ];

    this.selected.device = "routers";
    this.selected.command = "backupDevice";

    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(-2000))
      .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json('assets/collection.json').then(function (data: any) {

      const nodes: Node[] = [];
      const links: Link[] = [];

      data.nodes.forEach((d) => {
        nodes.push(<Node>d);
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

      /*  function dragstarted(d) {
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
  }

  setCommand($command) {
    this.selected.command = $command;

    if (this.selected.command === "restoreDevice") {
      this.data.getVersions(this.selected).subscribe(data => {
        console.log(data);
        for (let s in data) {

          var formatName:string = data[s].split(`${this.selected.device}-`)[1];
          
          formatName = formatName.replace('.txt','');
           
          const version: Version = <Version>{ placeholder: formatName, name: data[s] };

          this.versionsList.push(version);

          this.versionSelectBool = true;
        }
      });

      if (this.versionsList.length == 0) {
        console.log("couldn't retrieve version list.");
      }
    }
  }

  setVersion($version) {
    this.selected.version = $version;
  }

  btnClick() {
    /* this.h1Style = true;
    console.log("clicked"); setting bool and logging to console */

    this.data.runPlaybook(this.selected).subscribe(data => {
      this.response = data;
    });
  }
}
