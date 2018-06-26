# ExpressjsBlanky

Get up and running FAST on your next API project.

# Deploy

Use Docker!

If you are deploying your app for the first time, follow the instructions here. Else, view the instructions for [deploy changes](#deploy-changes)

* First, we need to deploy a postgres DB server.

```
$> docker-compose -f docker-compose.db.yml -f docker-compose.db-staging.override.yml up --build -d

for production:
$> docker-compose -f docker-compose.db.yml -f docker-compose.db-prod.override.yml up --build -d
```

* Then, edit `app/config/config.json` production host value to the IP address of the postgres server. Make sure to edit staging or production depending on what environment you are wanting to run.

* Go into your DNS settings for your site (I prefer Cloudflare for instant propigation) and change your DNS for `foo.levibostian.com` or `staging.levibostian.com` depending on your environment you want to run to the IP address of your server. We need this to get SSL running.

* Run the app:

```
# run from root of the Foo-app project.
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml up --build -d # this is for staging.

for production:
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml -f docker-compose.prod.override.yml up --build -d
```

# Deploy changes

If you already have docker-compose containers running with instructions for [deploy](#deploy), then use these to build a new image and rebuild the containers to deploy the changes.

Instructions found [in the Docker compose prepare for prod doc](https://docs.docker.com/compose/production/)

* Rebuild image for the docker-compose server `foo-app`:

```
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml build foo-app

for production:
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml -f docker-compose.prod.override.yml build foo-app
```

* Now, deploy this new image built above. This will deploy via daemon (-d argument) while not creating new containers for it's dependencies.

```
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml up --no-deps -d foo-app

for production:
$> docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml -f docker-compose.prod.override.yml up --no-deps -d foo-app
```

And your app is deployed.

# Development

Use ngrok to test the local API.

```
$> npm run dev:run
$> ngrok http 5000
```

I am trying to get Docker to be my dev environment. `docker-compose -f docker-compose.yml  -f docker-compose.dev.override.yml up --build` (yes, the `-f` order matters) is how I am getting them to run my dev environment. I am, however, having issues with sqlite3 working. I get the 'install sqlite3 manually' error. I am thinking about creating a Docker image that is *only* sqlite3 that I can connect to in the app/config/config.json. Perhaps that would solve the issue. I want to be able to remove sqlite3 from package.json! Such a pain getting it installed with npm.

# DB migrations

* To create a migration file for sequelize, run command:

```
npm run db:migrate:create --name describe-migration-here
```

* Open up this new migration file created under `migrations/` directory. Edit it to code that runs the migration.

* Run the migration:

```
npm run db:migrate:run
```

ExpressjsBlanky is designed to read the value of `NODE_ENV` and setup the environment for you. The config file does it all from there.

# Documentation

This API is uses [apidoc](http://apidocjs.com/) for API documentation.
All documentation is located in HTML in `apidoc/`. You can open `apidoc/index.html` directly in your web browser to view the API documentation.

# Backups

I am using Docker to make postgres backups for my database on CoreOS.

To do this, you need to create a couple of times.

```
sudo su - # must be root to create a service.

cd /etc/systemd/system
vi foo-app-pg-backup.service
```

And inside, put the following:

```
[Unit]
Description=Backup for Postgres Foo App database
Requires=docker.service

[Service]
Type=simple
Environment="IMAGE=krancour/postgresql-s3-backup:latest" "CONTAINER=foo-app-backup"
ExecStartPre=/bin/sh -c "docker history $IMAGE >/dev/null 2>&1 || docker pull $IMAGE"
ExecStartPre=/bin/sh -c "docker inspect $CONTAINER >/dev/null 2>&1 && docker rm -f $CONTAINER || true"
ExecStart=/bin/sh -c "docker run --name $CONTAINER --rm \
  -v /var/lib/backups/data:/root/Backup/data \
  -v /var/lib/backups/log:/root/Backup/log \
  -e DB_NAME=foo-prod \
  -e DB_USERNAME=foo \
  -e DB_PASSWORD=1234567890 \
  -e DB_HOST=29.398.44.55 \
  -e DB_PORT=5432 \
  -e S3_ACCESS_KEY=1234567890 \
  -e S3_SECRET_KEY=abcdefghijklmop \
  -e S3_REGION=us-east-1 \
  -e S3_BUCKET=db-backups \
  -e S3_PATH=foo-app \
  -e S3_KEEP=20 \
  $IMAGE"

[Install]
WantedBy=multi-user.target
```

Then, create another file: `foo-app-pg-backup.timer` in the same directory:

```
[Unit]
Description=Backup for Postgres Foo Ap db
Requires=docker.service

[Timer]
OnCalendar=0,8,16:00:00 # run every 8 hours
OnBootSec=0min

[Install]
WantedBy=multi-user.target

[X-Fleet]
X-ConditionMachineOf=foo-app-pg-backup.service
```

Startup the timer to start running: `systemctl start foo-app-pg-backup.timer`

---

Since I created a volume with the docker backup image, you can view the logs of the image after it runs: `tail /var/lib/backups/log/backup.log`. I would check this right away because I already found issues with it not running successfully as the docker backup image's postgres version is out of date. The image needs rebuilt.
