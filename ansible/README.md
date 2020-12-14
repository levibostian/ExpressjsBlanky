# Getting started

* Create a new Debian server in DigitalOcean. When creating this server, make sure these options are set:

1. Select 64bit Debian image. This doc is written when the latest version is 10. 
2. Add 1 block storage volume to the server. Choose whatever size you want. The database server setup playbook will move the postgres database location to this external volume. 
3. Add the server to a virtual network (in DigitalOcean, it's called a VPC). We will make sure that the kubernetes cluster that our application is hosted on will be added to this private network. 
4. Enable monitoring so you can enable alerts on big loads to the server. 
5. Set authentication to SSH keys. We want to make this server SSH key login, only. No password login with SSH. 
6. Hostname, tags are all up to you. 
7. You don't need to enable system backups/snapshots. We will run pg_dump to run periodic postgres database backups. 

When you create this new server, that's all that you need to do to the server. Ansible will perform *all* setup of this server!

* On your development machine, install dependencies:

[Install Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) on your local machine (not the DigitalOcean server you created) and then run these commands from this `ansible/` directory where this README document is located. 

```
ansible-galaxy install -r galaxy-requirements.yml
pip install -r pip-requirements.txt
```

* Go into `group_vars/dbservers` file. This file contains all of the dynamic variables that are read by the Ansible playbooks. Modify these values to values that you want for your server. Change the password values, for example. 

* Go into `testing_inventory` or `production_inventory`. Towards the top, you will see 

* Now, it's time to run the Ansible playbook for the task that you want to complete. 

View the list of playbooks available and how to run them in the [Playbooks](#Playbooks) section of this document. 

# Playbooks 

### Database server setup

This playbook is designed to setup a server for hosting a Database. Redis and Postgres. The playbook will install all softwares, configure them, and secure the server. 

##### Run playbook

This first playbook is initial setup like changing the SSH port of the server and creating a non-root user. 
```
ansible-playbook --extra-var ansible_port=22 -i <inventory-file> db_server_setup/initial_setup.yml
```
> Note: Replace `<inventory-file>` with the name of your inventory file. 

After setup, run this other playbook to get all of the rest of the server setup:

```
ansible-playbook --ask-become-pass -i <inventory-file> db_server_setup/main.yml
```
> Note: You will be asked for a "BECOME password". Enter in the password you have entered for `trunk_password` in the config file. 

### Postgres create new databases

This playbook is the boilerplate code to create new databases for your postgres database. These playbooks will create the database and run commands to secure it. 

##### Run playbook 

```
ansible-playbook --ask-become-pass -i <inventory-file> postgres_new_db/main.yml`
```

# Assumptions

* The playbooks have been written and tested on a Debian 10 server created in DigitalOcean. Ansible was executed on a macOS computer. 

These playbooks more then likely can...
...be executed from a Linux or Windows computer. Ansible is compatible with these machines. 
...be executed on a Debian server created by another server provider besides DigitalOcean (Linode, AWS, etc). However, these playbooks are hard-coded to work with external volumes that are located in `/mnt/volume_*` path on the created server. DigitalOcean creates external volumes with a location similar to this: `/mnt/volume_nyc1_1`. If other providers have a mounting convention that is similar (example: `/mnt/volume_foo`) then these playbooks will work. 
...be executed on a Ubuntu-like operating system that is not Debian. If you are looking for Red Hat, CentOS or something else that is not Ubuntu/Debian style, this playbook will probably not work. 

# Development 

If you need to do some development with these Ansible playbooks, the docs below will be helpful to you. 

#### Requirements 

All of the playbooks in this project are written with these requirements:
1. Playbooks need to be written in a way that you can run the playbooks 2+ times on a set of servers with success. If you write your playbooks in a way that are successful on the first run but fail on the 2+ runs, that is a flawed playbook. 
2. Assume that an error can happen at anytime with any task. Use [Ansible blocks](https://docs.ansible.com/ansible/latest/user_guide/playbooks_blocks.html#playbooks-blocks) to help group tasks together and maybe do some error handling. 
3. Assume that Ansible is the only program that performs *any* changes to the servers. For example: If you need to install the Go programming language on the Debian server, *do not* SSH into the Debian server and install Go manually. Do all server changes with Ansible. 
4. Keep the servers clean. If your playbook role has a dependency (such as rsync), install the dependency, run your tasks using that dependency, then uninstall that dependency. Don't keep those dependencies installed unless it's needed for the server to do it's job. 
5. For long, complicated tasks, it's ok to use [Ansible conditionals](https://docs.ansible.com/ansible/latest/user_guide/playbooks_conditionals.html) to skip doing those tasks. 

A good example is moving the postgres database files to another directory on the server. This task is long, more complicated, and only needs to be done 1 time. After it is moved, you should never have to do this ever again. So, in the Ansible playbook, skip these tasks if Ansible can determine the postgres database is already in the correct directory location. 

A bad example would be editing the configuration files of Redis. These tasks are quick, not complicated, and can be modified at anytime. We may configure the Redis server when the server is first created but we may need to make modifications later on. These tasks should be run all the time. 
6. The playbooks here should be simple. They should (1) contain a collection of default variables and (2) run roles. Playbooks should not contain complex roles, they should instead *run roles*. That means that roles should be written and stored externally in other source code repositories. This promotes concentrated testing of these separate roles, re-useability, version control, less copy/paste when you create many projects from this code base.
