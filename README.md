# NetVision

## About

This is a project that was created for my final project of university as part of my Computer Systems & Networks degree which I had recently updated and will continue to as time permits.Please note it does currently not work on chrome and potentially safari, so please ensure you use this with either Firefox,Internet Explorer or Microsoft Edge.

The project was aimed towards network admins who have a lot of daily tasks that involve configuring several devices with very tedious tasks.  A good example of this is disabling unused interfaces on a device as such they would need to have an easy to use layout on the website, and it would need to report any errors the system may encounter when it connects to the backend systems to perform the task that was selected.
My project objectives were initially to create a project that would improve work collaboration in a network in; however, the goals of the project had to change due to technical issues preventing me from being able to meet some of the initial requirements. The project would still provide a more straightforward service for any clients even after the changes were implemented. The new objectives included:
* Providing a more unobstructed view of their systems
* To providing automated backups
*	To allow for device backups and restoration
*	Allow the network diagram to update based on the network layout
*	To automate some basic configurations

## Features

* Is dynamic (does not need refreshing)
*	Allows for minor automated configuration of devices
*	Provides a graphical overview of the network.  

## Possible to do list 

* See project area

## How to use

### Refreshing the device list
To refresh the device list, it is as easy as pressing the button and waiting on this screen shown below which after a while will display the result of the scan and then show you the available devices as well as any errors that occurred as well as refreshing the network map.
 
### Backing up a device
To back up a device, you will need to select a device from the drop down and then choose the backup command in the next dropdown. Following this click the run button to initiate the process, and once it is done, you will either receive a backed up successfully message or a failed message.

### Restoring a device
To restore a backed up config, you will need to select the device in the same way as before and then choose the restore command option which will either present a new dropdown to select the backup version or will display an error stating there are no backups for the selected device.

### Deleting a backup
When deleting a backup, you will realise that the dropdown is different as you can search by date or time as well as select more than one backup to delete. Once this has been done, just continue as usual by hitting the run button.

### Controlling automatic backups
When the server starts, it begins automatic backups by default so to have control over this you can press the toggle backup button to toggle it on and off and each time you will receive a notification informing you of the current state if the toggle command was successful.

### Removing unused interfaces
To remove unused interfaces, it is the same as before except selecting the removed unused interfaces option for the command dropdown. 

## Installation

*Important while setting up the API on the linux machine 

1. Open/Install VS code, Install Node.js and NPM if they are not already on your machine and ensure your network is accessible from the computer you wish to set this up on.

2. Download the repo to your nginx or other web host sites folder.

3. Open a console and navigate to the folder ‘…\NetVison’ and then run the command ‘npm install’ command to install the required packages.

4. Change the serverAddress in order to connect to the ip address of your linux host on line 14 of the data.service.ts file to match the address of your API(Linux Machine).
 
5. Then run the command ‘ng serve’ and wait until the web server starts up.
 
6. Copy the Ansible_FilesAndBash folder within Express_API to your ansible enviroment and ensure that you have edited the vault_pass and vault file to include a password and have encrypted the vars file using the commands detailed [here](https://docs.ansible.com/ansible/latest/user_guide/vault.html#encrypt-string-for-use-in-yaml) and you will also need to set the IP addresses for routers and switches within the hosts file.

7. Open another terminal and navigate to the folder ‘\NetVision\Express_API’ and run the ‘npm install’ command followed by ‘npm start’ which will start up the express API which will also begin the automatic backup process which by default will backup to documents backups folder and in the folder above this once you have refreshed devices it will create a collection that the network map will use.   

8. Navigate to the web address: http://localhost:4200/, and you’ll find the website running locally.

## Issues

If you have any problems launching the website or API you can try and fix them using ‘npm audit fix --force’

If you come across any other problems while using this project or have any suggestions, feel free to create an issue with as much information as you can.

## Packages/Requirements

* [Expressjs](https://expressjs.com/en/api.html)

* [ng-multiselect-dropdown](https://cuppalabs.github.io/angular2-multiselect-dropdown/#/basic)

* [ng-bootstrap](https://getbootstrap.com/docs/4.0/components/alerts/)

* [moment.js](https://momentjs.com/docs/)

* [Node-ansible](https://www.npmjs.com/package/node-ansible)

* [D3.js](https://d3js.org/)

* [Shelljs](https://www.npmjs.com/package/shelljs)

* [Ansible](https://www.npmjs.com/package/node-ansible):

* [ios_command](https://docs.ansible.com/ansible/latest/modules/ios_command_module.html)

* [ios_config](https://docs.ansible.com/ansible/latest/modules/ios_config_module.html)

* [ios_facts](https://docs.ansible.com/ansible/latest/modules/ios_facts_module.html)

* [copy module](https://docs.ansible.com/ansible/latest/modules/copy_module.html)

* [net_put](https://docs.ansible.com/ansible/latest/modules/net_put_module.html)

## License

This project is available under the MIT license. See the LICENSE file for more info.
