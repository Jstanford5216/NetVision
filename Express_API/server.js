const express = require('express');
const bodyParser = require('body-parser');
const Ansible = require('node-ansible');
const shell = require('shelljs');
const fs = require('fs');

const app = express();

app.listen(3000, () => {
  console.log('Server started!');
});

app.use(bodyParser.json());

app.use(function (res, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //any for testing, ensure to change to one host only
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

app.route('/api/:name').get((req, res, next) => {

  query = req.params['name'];

  if (query == "devices") {

    var deviceList = [];

    command = new Ansible.Playbook().playbook("getDeviceInfo");
    //Set inventory
    command.inventory('hosts');

    //live results
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    command.exec({ cwd: "/etc/ansible/playbooks" });

    shell.cd("/home/jason/Documents/backups");
    deviceFileList = shell.ls("*DeviceInfo*");
    for (let f in deviceFileList)
    {
      fs.readFile(f,'utf8', function(err,contents) {
        deviceList.push(contents);
      });
    }
    
    /* var jsonObj = require("/home/jason/Documents/collection.json"); */
    res.send(deviceList);
  }
  else {
    const requestedDevice = req.params['name'];
    var versionList = [];
    shell.cd("/home/jason/Documents/backups");
    versionList = shell.ls(`${requestedDevice}*`);
    res.send(versionList);
  }
});

app.route('/api/').post((req, res, next) => {
  var command;
  var deviceF = req.body.device;
  if (deviceF == "All_Devices") {
    deviceF = "all";
  }

  if (req.body.version != null || req.body.version != "") {
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF, selectedVersion: req.body.version });
  }
  else {
    //Create command
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF });
  }
  //Set inventory
  command.inventory('hosts');

  //live result
  command.on('stdout', function (data) { console.log(data.toString()); });
  command.on('stderr', function (data) { console.log(data.toString()); });

  //Execute command
  var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

  promise.then(function (result) {
    res.send(201, result.code);
  });
});

app.route('/api/:name').put((req, res, next) => {
  res.send(200, req.body);
});

app.route('/api/:name').delete((req, res, next) => {
  res.sendStatus(204);
});
