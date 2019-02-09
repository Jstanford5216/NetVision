const express = require('express');
const bodyParser = require('body-parser');

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
  //ssh 
  console.log(req.name);
  res.send(201, req.body);
});

app.route('/api/:name').put((req, res,next) => {
  res.send(200, req.body);
});

app.route('/api/:name').delete((req, res,next) => {
  res.sendStatus(204);
});