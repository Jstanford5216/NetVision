const express = require('express');
const bodyParser = require('body-parser');
const Ansible = require('node-ansible');
const shell = require('shelljs');
const fs = require('fs');
const cors = require('cors');
const { fork } = require('child_process');

const app = express();

var forked = fork('/var/www/html/prco304-final-year-project-Jstanford5216/Express_API/autobackup.js');

var autobackupOn = true;

forked.on('message', (msg) => {
    console.log(msg);
});

app.listen(3000, () => {
  console.log('Server started!');
});

app.use(bodyParser.json());

app.use(cors({
  origin: '*'
}));

app.route('/api/:name').get((req, res) => {

  query = req.params['name'];

  if (query == "toggleAutoBackup") {
    if(autobackupOn == true)
    {
      autobackupOn = false;
      forked.kill('SIGINT');
      res.send({text:"Auto-backup disabled"});
    }
    else
    {
      autobackupOn = true;
      forked = fork('/var/www/html/prco304-final-year-project-Jstanford5216/Express_API/autobackup.js');
      res.send({text:"Auto-backup enabled"});
    }
  }

  else if (query == "CachedDevices") {
    var jsonObj = JSON.parse(fs.readFileSync("/home/jason/Documents/collection.json"));
    res.send(jsonObj);
  }
  else if (query == "NewDevices") {

    command = new Ansible.Playbook().playbook("getDeviceInfo");
    //Set inventory
    command.inventory('hosts');

    //live results
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    command.exec({ cwd: "/etc/ansible/playbooks" });

    function afterTimeout() {
      command = new Ansible.Playbook().playbook("getDeviceInfo2");

      command.inventory('hosts');


      command.on('stdout', function (data) { console.log(data.toString()); });
      command.on('stderr', function (data) { console.log(data.toString()); });


      var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

      promise.then(function (result) {

        const nodes = [];
        var links = [];

        shell.cd("/home/jason/Documents/backups");
        deviceFileList = shell.ls("*DeviceInfo*");

        var i = -1;

        deviceFileList.forEach(function (d) {
          i++;
          var contents = fs.readFileSync(`/home/jason/Documents/backups/${d}`, 'ascii').split('\n');
          var j = -1;
          var node = {};
          if (contents[0].includes("SW")) {
            node = { id: contents[0].trimRight(), group: 2 }
          }
          else {
            node = { id: contents[0].trimRight(), group: 1 };
          }
          nodes.push(node);
          contents.forEach(function (c) {
            j++;
            if (j >= 6) {
              var filtered = contents[j].split('  ').filter(function (output) {
                return output != "";
              });
              var link = { source: contents[0].trimRight(), target: filtered[0].split('.')[0], label: `${filtered[1]} to ${filtered[5].trimLeft()}` };
              links.push(link);
            }
          });
        });
        var k = -1;
        links.forEach(function (l) {
          k++;
          links.forEach(function (o) {
            var searchText = `${l.label.split("to")[1].trimLeft()} to ${l.label.split("to")[0].trimRight()}`;
            if (l.source == o.target && searchText == o.label) {
              links.splice(k, 1);
            }
          });
        });
        var deviceList = { nodes: nodes, links: links };
        //store json in file
        var jsonContent = JSON.stringify(deviceList);
        fs.writeFile("/home/jason/Documents/collection.json", jsonContent, 'utf8', function (err) {
          if (err) {
            res.send("error occured");
          }
          else {
            //clean up files
            shell.rm("*DeviceInfo*");
            res.status(201).send(result.code.toString());
          }
        });
      });
    }
    setTimeout(afterTimeout, 10000);
  }
  else {
    const requestedDevice = req.params['name'];
    var versionList = [];
    shell.cd("/home/jason/Documents/backups");
    versionList = shell.ls(`${requestedDevice}*`);
    res.send(versionList);
  }
});

app.route('/api/').post((req, res) => {
  var command;
  var deviceF = req.body.device;
  if (deviceF == "All_Devices") {
    deviceF = "all";
  }

  if (req.body.version != null && req.body.version != "" && req.body.command == "unusedInterfaces") {
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF });

    //Set inventory
    command.inventory('hosts');

    //live result
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

    promise.then(function (result) {
      shell.cd("/home/jason/Documents/backups");
      var deviceUnusedList = shell.ls("*UnusedInterfaces*");
      deviceUnusedList.forEach(function (d) {
        var contents = readFileSync(`/home/jason/Documents/backups/${d}`, 'ascii').split('\n');
        var device = contents[0].trimRight();
        var intList = [];
        for (i = 0; i <= contents.length - 1; i++) {
          if (contents[i].includes("is up") && contents[i + 1].includes("Last input never")) {
            intList.push(contents[i].split("is up,")[0].trimRight());
          }
        }
        if (intList.length != 0) {
          command = new Ansible.Playbook().playbook("unusedInterfaces2")
            .variables({ selectedHost: device, unusedList: intList });

          //Set inventory
          command.inventory('hosts');

          //live result
          command.on('stdout', function (data) { console.log(data.toString()); });
          command.on('stderr', function (data) { console.log(data.toString()); });

          //Execute command
          promise = command.exec({ cwd: "/etc/ansible/playbooks" });

          promise.then(function (result2) {
            shell.rm("*UnusedInterfaces*");
            res.status(201).send(result2.code.toString());
          });
        }
        else {
          res.send(result.code.toString());
        }
      });
    });
  }

  else if (req.body.version != null && req.body.version != "" && req.body.command == "deleteDevice"){
    shell.cd("/home/jason/Documents/backups");
    shell.rm(req.body.version);
    if (shell.error() == null)
    {
      res.send({text:"Error occured"});
    }
    else
    {
      res.send({text:"Backup removed successfully!"});
    }
  }

  else if (req.body.version != null || req.body.version != "") {
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF, selectedVersion: req.body.version });

    //Set inventory
    command.inventory('hosts');

    //live result
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

    promise.then(function (result) {
      res.status(201).send(result.code.toString());
    });
  }

  else {
    //Create command
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF });

    //Set inventory
    command.inventory('hosts');

    //live result
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

    promise.then(function (result) {
      res.status(201).send(result.code.toString());
    });
  }
});

app.route('/api/:name').delete((req, res) => {
  res.sendStatus(204);
});
