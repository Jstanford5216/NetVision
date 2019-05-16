const shell = require('shelljs');
const Ansible = require('node-ansible');
const moment = require('moment');

function autobackupProcess() {
    setTimeout(() => {

        process.send("Auto-Backup started"); //Inforn parent proccess that it has started

        command = new Ansible.Playbook().playbook("backupDevice")
            .variables({ selectedHost: "all" }); //Intialise playbook

        command.inventory('hosts');

        //command.on('stdout', function (data) { console.log(data.toString()); });
        //command.on('stderr', function (data) { console.log(data.toString()); });

        var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

        promise.then(function (result) {
            if (result.code == 0) {
                shell.cd("/home/jason/Documents/backups");
                var backupList = shell.ls();
                var lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7); //Calculate 7 days prior to todays date
                lastWeek = moment(lastWeek).format('DD-MM-YYYY HH:mm');

                var backupsCleared = false;

                backupList.forEach(function (a) {
                    var fileDate = new Date();
                    fileDate = a.split('~')[1].split('.')[0]; //Check if any backups are over 7 days old if so remove them and set bool true to test
                    if (fileDate <= lastWeek) {
                        shell.rm(a);
                        backupsCleared = true;
                    }
                });
                if (backupsCleared == true) { //Send message to parent if backups have been cleared
                    process.send("Last weeks backups cleared!");
                }
                process.send("All devices backed up sucessfully!"); //Send success upon success
            }
            else {
                process.send("Error when attempting auto-backup of devices"); //Inform parent of any playbook errors 
            }
        });

        autobackupProcess(); //Start recurrsive proccess again after 2 minutes

    }, 120000 /*1 day = 83200000*/);
}

autobackupProcess(); //Start proccess on creation



