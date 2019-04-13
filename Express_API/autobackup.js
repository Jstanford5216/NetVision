const shell = require('shelljs');
const Ansible = require('node-ansible');
const moment = require('moment');

function autobackupProcess() {
    setTimeout(() => {

        process.send("Auto-Backup started");

        command = new Ansible.Playbook().playbook("backupDevice")
            .variables({ selectedHost: "all" });

        command.inventory('hosts');

        //command.on('stdout', function (data) { console.log(data.toString()); });
        //command.on('stderr', function (data) { console.log(data.toString()); });

        var promise = command.exec({ cwd: "/etc/ansible/playbooks" });

        promise.then(function (result) {
            if (result.code == 0) {
                shell.cd("/home/jason/Documents/backups");
                var backupList = shell.ls();
                var lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                lastWeek = moment(lastWeek).format('DD-MM-YYYY HH:mm');

                var backupsCleared = false;

                backupList.forEach(function (a) {
                    var fileDate = new Date();
                    fileDate = a.split('~')[1].split('.')[0];
                    if (fileDate <= lastWeek) {
                        shell.rm(a);
                        backupsCleared = true;
                    }
                });
                if (backupsCleared == true) {
                    process.send("Last weeks backups cleared!");
                }
                process.send("All devices backed up sucessfully!");
            }
            else {
                process.send("Error when attempting auto-backup of devices");
            }
        });

        autobackupProcess();

    }, 120000 /*1 day = 83200000*/);
}

autobackupProcess();



