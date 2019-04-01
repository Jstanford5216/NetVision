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
  if (query == "CachedDevices"){
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
          var contents = fs.readFileSync(`/home/jason/Documents/backups/${deviceFileList[i]}`, 'ascii').split('\n');
          var j = -1;
          var node = { id: contents[0].trimRight(), group: 1 };
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
            if(l.source == o.target && searchText == o.label)
            {
               links.splice(k,1);
            }
          });
        });
        var deviceList = { nodes: nodes, links: links };
        //store json in file
        var jsonContent = JSON.stringify(deviceList);
        fs.writeFile("/home/jason/Documents/collection.json", jsonContent, 'utf8', function (err) {
          if (err) {
            res.send({ text: "error occured" });
          }
        });
        //clean up files
        shell.rm("*DeviceInfo*");
        res.send(201, result.code);
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
