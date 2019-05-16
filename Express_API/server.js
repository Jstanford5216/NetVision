const express = require('express');
const bodyParser = require('body-parser');
const Ansible = require('node-ansible');
const shell = require('shelljs');
const fs = require('fs');
const cors = require('cors');
const { fork } = require('child_process');

const app = express();

var forked = fork('/var/www/html/prco304-final-year-project-Jstanford5216/Express_API/autobackup.js'); //Initalise modules and start auto backup

var autobackupOn = true;

forked.on('message', (msg) => { //Set listener so any message recieved from forked instance will be displayed in console
  console.log(msg);
});

app.listen(3000, () => { //Start server 
  console.log('Server started!');
});

app.use(bodyParser.json()); //Use bodyparser and cors module with the app allowing all connections for debugging purposes but in real world would use only the web server address
//and add strict control if required
app.use(cors({
  origin: '*'
}));

app.route('/api/:name').get((req, res) => { //Get request and response object for any request to this route

  query = req.params['name']; //Find out the selected command 

  if (query == "toggleAutoBackup") {
    if (autobackupOn == true) {
      autobackupOn = false;
      forked.kill('SIGINT'); //Toggle auto-backup by killing forked proccess or by creating a new forked object 
      res.send({ text: "Auto-backup is now disabled." });
      console.log("Auto-backup is now disabled.");
    }
    else {
      autobackupOn = true;
      forked = fork('/var/www/html/prco304-final-year-project-Jstanford5216/Express_API/autobackup.js');
      res.send({ text: "Auto-backup is now enabled." });
      console.log("Auto-backup is now enabled.");
    }
  }

  else if (query == "CachedDevices") { //Read list of nodes compiled previously and send to front end as json
    var jsonObj = JSON.parse(fs.readFileSync("/home/jason/Documents/collection.json"));
    res.send(jsonObj);
  }
  else if (query == "NewDevices") {

    command = new Ansible.Playbook().playbook("getDeviceInfo"); //Initalise ansible methods
    //Set inventory
    command.inventory('hosts');

    //live results
    command.on('stdout', function (data) { console.log(data.toString()); }); //Setup live output from playbooks 
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    command.exec({ cwd: "/etc/ansible/playbooks" }); //Run playbook

    function afterTimeout() { //Wait for cdp to initalise on devices then start playbook part 2 
      command = new Ansible.Playbook().playbook("getDeviceInfo2");

      command.inventory('hosts');


      command.on('stdout', function (data) { console.log(data.toString()); });
      command.on('stderr', function (data) { console.log(data.toString()); });


      var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

      promise.then(function (result) {

        const nodes = [];
        var links = [];

        shell.cd("/home/jason/Documents/backups"); //Store each devices neighbors and name
        deviceFileList = shell.ls("*DeviceInfo*");

        var i = -1;

        deviceFileList.forEach(function (d) {
          i++;
          var contents = fs.readFileSync(`/home/jason/Documents/backups/${d}`, 'ascii').split('\n');
          var j = -1;
          var node = {};
          if (contents[0].includes("SW")) {
            node = { id: contents[0].trimRight(), group: 2 } //Change colour based on name for switch or router
          }
          else {
            node = { id: contents[0].trimRight(), group: 1 };
          }
          nodes.push(node); //Add formatted nodes to array
          contents.forEach(function (c) {
            j++;
            if (j >= 6) {
              var filtered = contents[j].split('  ').filter(function (output) {
                return output != "";
              });
              var link = { source: contents[0].trimRight(), target: filtered[0].split('.')[0], label: `${filtered[1]} to ${filtered[5].trimLeft()}` };
              links.push(link); //Add links to array from splitting output
            }
          });
        });
        if(nodes.length != 0) //ensure no link manipulation takes place when only one device present
        {
        var k = -1;
        links.forEach(function (l) {
          k++;
          links.forEach(function (o) {
            var searchText = `${l.label.split("to")[1].trimLeft()} to ${l.label.split("to")[0].trimRight()}`;
            if (l.source == o.target && searchText == o.label) { //If source and destination are the same for two links remove them from the array
              links.splice(k, 1);
            }
          });
          var matchCounter = 0;
          nodes.forEach(function (b) { //Remove any redundant links due to device being down
            if (l.source == b.id)
            {
              matchCounter++;
            }
            else if(l.target == b.id)
            {
              matchCounter++;
            } 
            else
            {
              var matchCounter = 0;
            }
          });
          if(matchCounter == 1)
          {
            links.splice(k, 1);
          }
        });
      }
        var deviceList = { nodes: nodes, links: links }; //Create final list with two headings nodes and links
        //store json in file
        var jsonContent = JSON.stringify(deviceList); //Convert list into JSON string to write to file
        fs.writeFile("/home/jason/Documents/collection.json", jsonContent, 'utf8', function (err) {
          if (err) {
            res.send("error occured");
          }
          else {
            //clean up files
            shell.rm("*DeviceInfo*"); //Save file return output of promise object and clean up temporary files
            res.status(201).send({ text: result.output });
          }
        });
      }, function (err) { console.log(err); }); //if promise fails due to exception show error on console
    }
    setTimeout(afterTimeout, 10000);
  }
  else {
    const requestedDevice = req.params['name'];
    var versionList = []; //If nothing else it will be for list of backups for device
    shell.cd("/home/jason/Documents/backups");
    versionList = shell.ls(`${requestedDevice}*`); //Return list of backups
    res.send(versionList);
  }
});

app.route('/api/').post((req, res) => {
  var command;
  var deviceF = req.body.device;
  if (deviceF == "All_Devices") {
    deviceF = "all";
  }

  if (req.body.version != null && req.body.command == "unusedInterfaces") { //If command is this pass selected device to playbook and execute it.
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
          if (contents[i].includes("is up") && contents[i + 1].includes("Last input never")) { //If output of playbook contains last input never and is also up it is deemed unused
            intList.push(contents[i].split("is up,")[0].trimRight());
          }
        }
        if (intList.length != 0) { //If port are unused then start stage two which is actually shutting them down by passing the interface list to the playbook
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
            shell.rm("*UnusedInterfaces*"); //Send result of promise back to front end
            res.status(201).send();
          },function(err){
            res.status(204).send();
          });
        }
        else {
          res.status(204).send(); //Show error if no unused ports
        }
      });
    });
  }

  else if (req.body.version != null && req.body.version != "" && req.body.command == "deleteDevice") {
    var errorOccured = false;

    shell.cd("/home/jason/Documents/backups");

    req.body.version.forEach(b => { //Navigate to directory and remove all listed backups from the folder
      shell.rm(b.name);
      if (shell.error() != null) {
        errorOccured = true;
      }
    });
    if (errorOccured == true) {
      res.status(500).send(); //If any error occured deleting one it will be passed back by status code as an error
    }
    else {
      res.status(204).send(); //If success send success message to front end
    }

  }

  else if (req.body.version != null || req.body.version != "") { //For restore or delete pass list of versions to playbook and run the slected command from the front end
    command = new Ansible.Playbook().playbook(req.body.command)
      .variables({ selectedHost: deviceF, selectedVersion: req.body.version[0] });

    //Set inventory
    command.inventory('hosts');

    //live result
    command.on('stdout', function (data) { console.log(data.toString()); });
    command.on('stderr', function (data) { console.log(data.toString()); });

    //Execute command
    var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

    promise.then(function (result) {
      res.status(201).send();
    },function(err) {
      res.status(500).send();
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
      res.status(201).send();
    },
    function(err){
      res.status(500).send();
    });
  }
});

app.route('/api/:name').delete((req, res) => {

});
