#!/bin/bash

# Script's job:
# 
# Run the ansible-playbook command. This is to (1) make it easier to run playbooks because this script walks you through it without having to memorize commands or copy/paste and (2) make sure that you run the playbooks against 1 environment and not all of them. 

set -e 
echo -e "\e[1;34m Light Blue Text\e[0m"

SELECTED_ENV="testing"

echo "What environment do you want to run the playbook against?"
select env in testing production
do 
    SELECTED_ENV=$env
    break
done

echo "Running on environment...$SELECTED_ENV"

echo "NOTE: You are going to be asked for a BECOME password. This is the password for the 'trunk' OS user account. Enter the 'trunk_password' you put in the group_vars/dbservers/X.yml file."

eval "ansible-playbook --ask-become-pass -i ansible/inventory.ini -l $SELECTED_ENV ansible/db_server_setup/main.yml"