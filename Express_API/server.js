const express = require('express');
const bodyParser = require('body-parser');
var Ansible = require('node-ansible');

const app = express();

app.listen(3000, () => {
  console.log('Server started!');
});

app.use(bodyParser.json());

app.use(function(res,res,next) {
  res.header("Access-Control-Allow-Origin","http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

app.route('/api/:name').get((req, res,next) => {
  const requestedDevice = req.params['name'];
  res.send({ name: requestedDevice });
  });
  
app.route('/api/').post((req, res,next) => {
  
  console.log(process.cwd())

  //Output sent value
  console.log(req.name);
  //Create command
  var command = new Ansible.Playbook().playbook('./playbooks/backup_devices');
                                    //.variables({ foo: 'bar' });
  //Set inventory
  command.inventory('./playbooks/hosts');
  
  //live result
  /* command.on('stdout', function(data) { console.log(data.toString()); });
  command.on('stderr', function(data) { console.log(data.toString()); }); */
  
  //Execute command
  var promise = command.exec();

  //Get result from promise
  promise.then(function(result) {
    console.log(result.output);
    console.log(result.code);
  });
  
  res.send(201, req.body);
});

app.route('/api/:name').put((req, res,next) => {
  res.send(200, req.body);
});

app.route('/api/:name').delete((req, res,next) => {
  res.sendStatus(204);
});