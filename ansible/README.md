# Ansible 

This API project requires some servers running software like databases to connect to. To setup these servers, this project is setup with the tool [Ansible](https://www.ansible.com/) to do all of the server setup. 

Why use Ansible? 
* **Prevent human error** - Manually setting up servers is a lot of copy and pasting and typing of commands. It is not uncommon for a typo to happen and the server has issues. By automating this process, we have eliminated the chance of this happening. 
* **Create servers, fast** - I create at least a dozen new servers every year. Each server that I create manually takes about half a day of work to create, configure, and test. Being able to create these servers in a matter of seconds or minutes makes a difference! 
* **Documentation** - I find it very frustrating to take over a Linux server that was setup and configured by someone else before you. You don't know what softwares were installed, how each software is configured, what user accounts exist and who has access to what. It may seem like it's easier to just delete the server and start over! By using a tool like Ansible, you are able to read the Ansible scripts and know *exactly* what has been done to the server - no more, no less. I try my very best to make sure that all changes done to a server exists here in the Ansible playbooks. 

# Getting started

* Create a new Debian server in DigitalOcean. Login to DigitalOcean's website and create this new server manually. When creating this server, make sure these options are set:

1. Select the 64bit Debian image. **This doc is written when the latest version is 10.**
2. Add 1 block storage volume to the server. Choose whatever size you want (it can be expanded in the future). Choose the default formatting option. (All database storage will exist on this block storage, not the included storage of the server) 
4. Enable monitoring so you can enable alerts on big loads to the server. 
5. Set authentication to SSH keys. We want to make this server SSH key login, only. *No password login with SSH.*
6. Hostname, tags are all up to you. I like to make the hostname be something like "<app-name>-production-database"
7. You don't need to enable system backups/snapshots. We will run pg_dump to run periodic postgres database backups. 

When you create this new server, that's all that you need to do to the server. Ansible will perform *all* setup of this server!

* On your development machine, install dependencies:

[Install Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) on your local machine (not the DigitalOcean server you created) and then run these commands from this `ansible/` directory where this README document is located. 

```
ansible-galaxy install -r galaxy-requirements.yml
pip install -r pip-requirements.txt
```

* Time to make some variables. 

```
cp ansible/group_vars/dbservers/environment_example.yml ansible/group_vars/dbservers/production.yml
cp ansible/group_vars/dbservers/environment_example.yml ansible/group_vars/dbservers/testing.yml
```

Inside of these 2 new files you just created, edit all of the lines that include `# !!!`. This is mostly a bunch of passwords. 

> Note: `group_vars/dbservers/all.yml` should not need modified. They are variables that are applied to all environments. Secrets such as API keys or passwords do not belong here. 

* Open `inventory.ini`. In the `[testing]` and `[production]` sections, list all of the *public IPv4 IP addresses* that you created in DigitalOcean. 

* Now, it's time to run the Ansible playbook for the task that you want to complete. 

View the list of playbooks available and how to run them in the [Playbooks](#Playbooks) section of this document. 

# Playbooks 

### Database server setup

This playbook is designed to setup a server for hosting a Database. Redis and Postgres. The playbook will install all softwares, configure them, and secure the server. 

To run this playbook, I have created a script to help make this simple. `./ansible/db_server_setup/run.sh`

> Note: You will be asked for a "BECOME password". Enter in the password you have entered for `trunk_password` in the config file. 

After you are done running the playbook:
1. Setup a [DigitalOcean firewall](https://www.digitalocean.com/docs/networking/firewalls/quickstart/) and attach it to your new server(s). When you create this firewall, here are the rules that you need:

Incoming rules:
* Port 222 (or whatever port that you setup in the Ansible playbook)
That's it! We do not open any ports for connecting to things like Redis or Postgres because those are connected via [private networking](https://www.digitalocean.com/docs/networking/vpc/). 

> Tip: If you need to connect to your postgres or redis server from your local development machine for debugging, use a SSH tunnel. 

Outgoing rules:
* Allow all

Along with the firewall, you can setup [DigitalOcean monitoring](https://www.digitalocean.com/docs/monitoring/) to get notified when things like CPU usage spikes happen on the server. 

### Postgres create new databases

This playbook is the boilerplate code to create new databases for your postgres database. These playbooks will create the database and run commands to secure it. 

To run this playbook, I have created a script to help make this simple. `./ansible/db_server_setup/run.sh`

> Note: You will be asked for a "BECOME password". Enter in the password you have entered for `trunk_password` in the config file. 

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
