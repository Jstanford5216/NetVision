#!/bin/bash
sudo service API stop
cd /var/www/html/prco304-final-year-project-Jstanford5216/
sudo git pull
sudo ng build --prod
sudo service nginx restart
sudo service API start 
