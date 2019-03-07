const express = require('express');
const bodyParser = require('body-parser');
const Ansible = require('node-ansible');
const shell = require('shelljs');

const app = express();

app.listen(3000, () => {
  console.log('Server started!');
});

app.use(bodyParser.json());

app.use(function(res,res,next) {
  res.header("Access-Control-Allow-Origin","http://10.0.0.1");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

app.route('/api/:name').get((req, res,next) => {
  const requestedDevice = req.params['name'];
  var versionList = [];
  shell.cd("/home/jason/Documents/backups");
  versionList = shell.ls(`${requestedDevice}*`);
  res.send(versionList);
  });
  
app.route('/api/').post((req, res,next) => {
  var command;
  if (req.body.version != null || req.body.version != "") {
    command = new Ansible.Playbook().playbook(req.body.command)
                                      .variables({ selectedHost: req.body.device, selectedVersion:req.body.version });
  }
  else{
  //Create command
  command = new Ansible.Playbook().playbook(req.body.command)
                                      .variables({ selectedHost: req.body.device });
  }
  //Set inventory
  command.inventory('hosts');

  //live result
  command.on('stdout', function(data) { console.log(data.toString()); });
  command.on('stderr', function(data) { console.log(data.toString()); }); 
  
  //Execute command
  var promise = command.exec({cwd:"/etc/ansible/playbooks"});

  res.send(201, req.body);
});

app.route('/api/:name').put((req, res,next) => {
  res.send(200, req.body);
});

app.route('/api/:name').delete((req, res,next) => {
  res.sendStatus(204);
});
