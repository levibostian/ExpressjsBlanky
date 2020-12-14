# Getting started

- Create a new Debian server in DigitalOcean with _one_ external volume attached. The size of the volume does not matter.

- Install dependencies

```
ansible-galaxy install nickjj.fail2ban
```

If running the playbook from a mac, you must install: `pip install passlib` to be able to generate secure passwords.

- Run the first playbook. This initial playbook does things like creating a non-root user account for security reasons and changes the default SSHh port. It's easier to run these tasks before running the rest of the server setup:

```
ansible-playbook --extra-var ansible_port=22 -i testing_inventory first_playbook.ym
```

- Run playbook: `ansible-playbook --ask-become-pass -i testing_inventory playbook.yml`

# Assumptions

- It's assumed that you are using DigitalOcean to run this playbook on a Debian OS.

The playbook can work with other providers but DigitalOcean, but there are some parts of the code that are hard-coded to work with DigitalOcean:

1. DigitalOcean when you attach external volumes, the volumes are mounted with a path and name: `/mnt/volume_*` (example: `/mnt/volume_nyc1_1`).

- It's assumed that you have _one_ external volume attached to the VM server.
- In postgres, if the current data_directory is _not_ located in a path that is prefixed with `/mnt`, then we will attempt to move it. To move it, it is assumed that the current set data_directory contains `/postgresql/`. The default postgres data_directory location is `/var/lib/postgresql/11/main` so that works.
