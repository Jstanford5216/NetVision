const express = require('express');
const bodyParser = require('body-parser');
var Ansible = require('node-ansible');

const app = express();

app.listen(3000, () => {
  console.log('Server started!');
});

app.use(bodyParser.json());

app.use(function(res,res,next) {
  res.header("Access-Control-Allow-Origin","http://192.168.0.251");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

app.route('/api/:name').get((req, res,next) => {
  const requestedDevice = req.params['name'];
  res.send({ name: requestedDevice });
  });
  
app.route('/api/').post((req, res,next) => {
  
  //Create command
  var command = new Ansible.Playbook().playbook('backup_devices')
                                      .variables({ selectedHost: req.body.name });
  
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
