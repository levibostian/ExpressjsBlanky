# ExpressjsBlanky

Boilerplate project for Expressjs apps. The template that [I](https://github.com/levibostian/) use for the apps that I build.

iOS developer? I have [a boilerplate project for you!](https://github.com/levibostian/iosblanky)
Android developer? I have [a boilerplate project for you!](https://github.com/levibostian/androidblanky)

# What are the goals of ExpressjsBlanky?

ExpressjsBlanky has been modified over years of building nodejs rest APIs. Through experience, you are guaranteed to find many annoyances and bugs. After each encounter, some engineering work is done to help remove that annoyance and prevent that bug from happening again.

ExpressjsBlanky comes equipped with the following goals:

- Strongly typed programming language via Typescript. After years of runtime exceptions from Javascript, it's time for something better.
- Full configuration of the application through environment variables as defined [in the 12factor app](https://12factor.net/config).
- Unit and integration testing.
- Easily create mocks and work with sample data in tests.
- Use a CI server to run lint, tests on each commit of the code.
- Full deployment of the app with CI server.
  - If possible, deploy to a brand new server with CI server. No pre-work to do.
- Run application within container (with Docker) to keep it portable.

# Getting started

- First, clone this repo:

```
git clone https://github.com/levibostian/ExpressjsBlanky.git NameOfYourNewApp
cd NameOfYourNewApp
rm -rf .git/
git init
git config user.email "you@example.com"
git config user.name "First Last"
git add .; git commit -m "Initial commit. Created project from levibostian/ExpressjsBlanky boilerplate.";
npm install
bundle install
```

- Next, follow all of the directions below in the [services](#Services) section to configuring the services this project is setup to work with.
- When you want to run the application locally on your machine for development purposes, follow the directions for [development](#development).
- If you want to run unit, integration tests for your application, check out the section for [tests](#tests).
- If you wish to deploy your application to a staging or production server, check out the section on [deployment](#deploy).

Enjoy!

# What is included in ExpressjsBlanky?

Go ahead and explore the source code! No need to include _all_ of the details here, but here is a gist of the major components of this project:

- Project uses [Typescript](https://www.typescriptlang.org/) compiled via [Babeljs](https://babeljs.io/) as the programming language.
- Background jobs queue done with [Bull](https://github.com/OptimalBits/bull).
- [Express](https://expressjs.com/) - The web framework used to create the API.
- Unit and integration tests executed with [Jest](https://jestjs.io/) testing framework.
- [Postgres](https://www.postgresql.org/) used as the database to store user data. Uses [sequelize](https://github.com/sequelize/sequelize) to interact with the database for all CRUD operations.

# Services

This project uses a list of various services to send push notifications, emails, run a CI server, and more. To keep the code base simple, [keep the environments close](https://12factor.net/dev-prod-parity), and avoid runtime complexity/bugs, all of these services are configured with environment variables all defined with a `.env` file.

The first thing you need to do is create a `.env` file in the root of the project.

_Note: This project relies on the CLI tool, [cici](https://github.com/levibostian/cici/) for helping with the environments. You may want to read up on the README of the project to understand how it's used in the scripts. Especially used on the CI server._

```
cp .env.example .env
```

Now, let's go into each of the variables, enabling the various services as we go on.

- [Honeybadger](https://www.honeybadger.io/for/node/) - Error reporting.

* Create a Honeybadger account.
* Create a new Honeybadger project.
* Set project API key environment variable.

- [Postmark](https://postmarkapp.com/) - Sending emails to users.

* Create an account [at Postmark's website](https://postmarkapp.com/). Add your domain name you want to send email from.
* After all of your setup is complete, you will have an API key for the server you want to send from. _Note: It may be a good idea to create multiple servers in Postmark: One for staging and production, one for development. However, you do what you feel is best_.
* Set project API key, domain, from email address, name environment variables.

* Create HTML templates in the Postmark website. You can include variables to make them dynamic!
* Add or edit the functions in `app/email/index.ts`. Create 1 function for each type of email you want to send. Then, when you're ready to send an email, `await emailSender.sendWelcome(toEmailAddress, {variable_name_here: variableValue})`.

- [AWS](https://aws.amazon.com/)

Next, we will use some AWS services.

- [Create an AWS account](https://aws.amazon.com/).
- Open up [AWS IAM to create a new user](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new?step=details). Name it something like `name-of-app` that includes the permissions needed for this project. Check `Programmatic access` checkbox. Click next. For attaching permissions, skip that for now. Each service below will ask you to add some. You will get an access key and a password generated for you. Save this information! You cannot recover it. I usually use a password manager like Lastpass to save this information in it.

* [AWS ECR](https://aws.amazon.com/ecr/) - Host private Docker images built from the API codebase.

- [Create a new repository for ECR](https://console.aws.amazon.com/ecs/home?region=us-east-1#/repositories/create/new) which is where you will store API Docker images. I recommend naming your repository with this convention: `nameOfYourCompany/nameOfYourProject`.
- Edit your AWS IAM user account for your app. Attach the `AmazonEC2ContainerRegistryPowerUser` policy permission.
- Edit environment variable for docker image name.

* [Firebase](https://firebase.google.com/) - Sending push notifications, dynamic links, and more.

* [Firebase Cloud Messaging (sending push notifications)](https://firebase.google.com/docs/cloud-messaging/admin/) - Send push notifications to Android or iOS apps from API.

- Follow the directions for [Generating the .json file with your private keys](https://firebase.google.com/docs/admin/setup). _Note: Put the .json file in the path: `config/firebase_key.json`. The API is already configured to use that file and work from there._
- Anytime you want to send a push notification to a user, use this code: `await jobQueueManager.queueSendPushNotificationToUser({...})`

* [Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links/) - Send URLs that can route your client applications to specific parts of your app.
  Configure:

1. If you want to use your own custom domain name for your dynamic links, [go to the Firebase Console to add your custom URL](https://console.firebase.google.com/project/_/durablelinks/links/).
2. If you use your custom domain or you use the generated URL that Firebase makes for you [in the Firebase Console](https://console.firebase.google.com/project/_/durablelinks/links/), you need to copy that URL and paste it in: `app/constants/index.ts`. Edit `login > dynamic_link_url` You will also want to add your Android package name and/or your iOS package name in the constants file if you have an Android or iOS app.

All of the query parameters you want to add to the dynamic link can be found [in these docs](https://firebase.google.com/docs/dynamic-links/create-manually).

### CI server

Oh, you need a CI server. This project is all setup, but you need to setup the [Travis CI](https://travis-ci.com/) service.

- Create a [Travis](https://travis-ci.com/) account, and enable your GitHub repo for your API project in your Travis profile page.

- [Danger](http://danger.systems/ruby/) - Bot that looks over my pull requests and make sure I do not forget to complete certain tasks. [Here are instructions](http://danger.systems/guides/getting_started.html#creating-a-bot-account-for-danger-to-use) for adding a Danger bot to your repo. This depends on if your app is an open source or closed source project. _Note: You need to create a Travis CI secret environment variable named `DANGER_GITHUB_API_TOKEN` with the API token generated for the bot._

# Development

Do you wish to build and run this Expressjs application locally on your machine for development? Let's do it.

To develop with ExpressjsBlanky, you need Docker and [nvm](https://github.com/nvm-sh/nvm) installed. That is it!

```bash
bundle install
nvm use
npm install
npm run dev:setup
npm run dev
```

_Note: Make sure to create a `.env` file with your environment configuration you want to use for development._

This will install everything you need and startup the application. Simple!

To debug your code, this project is setup to work with VSCode's built-in debugger. All you need to do is run the "Local development debug" task in VSCode and done! It will even reset the debugger and recompile your code on code change.

# Tests

This project is setup to create and run unit and integration tests against your code base super easily. For information on how to _write_ tests, check out the `tests/` directory.

```bash
npm run test:setup
npm run test
```

This will run all of your tests: unit and integration.

It's recommended that while you are developing your tests you use the [Jest](https://github.com/jest-community/vscode-jest) or [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VSCode extension for when you want to run or debug individual tests.

# Deploy

- First off, we need to deploy our database.

```
npm run db
```

_Note: This project is not setup with database backups. That is a different project._

- Next, we need to setup a reverse proxy to connect to our application.

I prefer to use AWS API Gateway. Create a AWS API Gateway as a HTTP reverse proxy that connect to your server with: `http://ip-address:5000`.

- Now, startup a Redis server. Make sure to edit the `./docker/redis.conf` with a new password and copy that password to `.env`. Then, start up the server.

```
npm run redis
```

- Create a firewall. To keep your application safe on your machine, create a firewall using AWS or DigitalOcean's built-in firewall tool.

| Type | Port                       |
| ---- | -------------------------- |
| TCP  | 222 (for ssh)              |
| TCP  | 5432 (postgres)            |
| TCP  | 5000 (for your nodejs app) |

- Next it is time to start up your application.

This project is setup to using a CI server to deploy your application for you. In order for the CI server to deploy your app, it must contain your environment variables. Since we don't want to store these files in the git repo for security and privacy reasons, they are stored in Travis as secrets.

The CI server should successfully use the tool [cici](https://github.com/levibostian/cici/) to decrypt the encrypted files for your deployment. Make sure to encrypt the files locally on your machine before you deploy.

Follow this GitHub workflow to run a deploy.

1. Get all of your pull requests into the `master` branch that you want in the release. Make sure you updated the `Versionfile` and `CHANGELOG.md` with your update information.
2. Make a git tag. If for the staging environment, make `X.X.X-staging`. If prod, make `X.X.X` tag. Replace `X.X.X` with version in Versionfile.
3. Git push. The CI server will run.

# DB migrations

_Note:_ You must create a migration for all database operations _including_ the very first initial database create. It's highly recommended to not use `sequelize.sync()` (including in development/testing) to avoid production runtime issues.

- To create a migration file for sequelize, run command: `npm run db:migrate:create -- --name describe-migration-here`
- Open up this new migration file created under `migrations/` directory. Edit it to code that runs the migration. Check out [the docs](http://docs.sequelizejs.com/manual/tutorial/migrations.html) on how to program migration code.
- The migration will run automatically with the CI server.

# Database backups

Database backups are automatically run on a schedule via cronjobs. The backup files are stored in a DigitalOcean Space (aka: object stored like AWS S3). Checkout the section in these docs on setting up Spaces.

// TODO. Talk about setting up automated backups here.

# Object stored

Cloud object stored (aka: AWS S3) products are super handy ways to store files. In this project, we use cloud object storage to store assets for the apps (images, files), backup files such as logs and database backups, and possibly more.

DigitalOcean Spaces is a great cloud object storage solution because we use DigitalOcean for everything already, and it's backed by a CDN for fast and affordable asset storage.

Spaces is charged \$5 per Space instance created. Each space can dynamically grow in space needed. Because of that, this project tries to use only 1 Space instance in the DigitalOcean account to save on price.

Because we want to use 1 Space instance to store many different types of data, it takes some organization to manage everything. Each type of file that we store has different requirements.

Public asset requirements:

- Public files. Anyone can access these files.
- Backed by CDN to save bandwidth and increase speed.

Backup files requirements:

- Private files. Only DigitalOcean account can access it.
- Has an expiration date where an upload file will be deleted in the future. This will save on cost to store as little files as possible.

When you create a new DigitalOcean Space for your API project, this is how it should be setup:

1. Location - Up to you. Because we will have the global CDN enabled, location does not matter as much. NYC3 is a good choice as it's the default.
2. Enable CDN. Set the TTL as long as you feel comfortable. The DigitalOcean API allows you to purge the CDN whenever you want so if you decide to update your assets, you can always purge the CDN.
3. Restrict file listing. No use for it and for security reasons, you can disable it.

### Public assets

I am assuming that you do not have many public assets to store. If that's the case, you can upload them and manage them using the DigitalOcean console webapp. Create a directory `public-assets` with subdirectories inside organizing the many assets. Select the files after you upload them and set them to be public. All of this can be managed from the console.

### Private assets

Private files such as database backups are backed by lifecycle policies because we want files to expire automatically to save on cost.

The convention that we follow is to create a directory in your Space called `30day_backups`, for example, which say how long the policy is for easy reference. Lifecycle policies are not managed with the DigitalOcean web app console so it's really easy to not understand there is a lifecycle set and mess something up. But because you are putting your files in a directory called `30day_backups`, you know that those files will only live for 30 days!

Create directories in the Space for these private files. `XXday_backups` (example: `30day_backups`) and inside that make subdirectories like `database` or `logs`.

[Create an API token](https://cloud.digitalocean.com/account/api/tokens) specifically for DigitalOcean Spaces. Keep the token a secret! It has full admin access to the entire Space.

Then, we need to set the lifecycle policy on the Space. One has already been created. See `docs/spaces_lifecycle_policy.xml` and [examples](https://developers.digitalocean.com/documentation/spaces/#create-bucket-lifecycle) to create one. Once it is created, it's time to set the policy on the Space. Note that only 1 policy can be set on the entire Space. You can set as many rules as you want in the policy.

To set the policy, you need to have [s3cmd](https://s3tools.org/download) installed (`brew install s3cmd` works). Most to all of the operations that you want to perform on Spaces are done with the s3cmd CLI tool. s3cmd is defaulted to work with AWS S3. To work with Spaces, you need to add `--host-bucket="%(bucket)s.nyc3.digitaloceanspaces.com" --region=US --host=nyc3.digitaloceanspaces.com` as arguments to s3cmd.

Set lifecycle:

```
s3cmd --host-bucket="%(bucket)s.nyc3.digitaloceanspaces.com" --region=US --host=nyc3.digitaloceanspaces.com --access_key=$DIGITAL_OCEAN_SPACES_ACCESS_KEY --secret_key=$DIGITAL_OCEAN_SPACES_ACCESS_SECRET setlifecycle docs/spaces_lifecycle_policy.xml s3://name-of-space
```

Get lifecycle that is set:

```
s3cmd --host-bucket="%(bucket)s.nyc3.digitaloceanspaces.com" --region=US --host=nyc3.digitaloceanspaces.com --access_key=$DIGITAL_OCEAN_SPACES_ACCESS_KEY --secret_key=$DIGITAL_OCEAN_SPACES_ACCESS_SECRET getlifecycle s3://name-of-space
```

# Documentation

This API is uses [apidoc](http://apidocjs.com/) for API documentation.

It is pretty easy to use. View the [official docs](http://apidocjs.com/) on the templating language and generate them using `npm run generate:doc`. Docs are generated in the `api_doc/` directory.

## Author

- Levi Bostian - [GitHub](https://github.com/levibostian), [Twitter](https://twitter.com/levibostian), [Website/blog](http://levibostian.com)

![Levi Bostian image](https://gravatar.com/avatar/22355580305146b21508c74ff6b44bc5?s=250)

## Contribute

ExpressjsBlanky is not open for contributions at this time. This project showcases _my_ preferred way to build a Expressjs app. If you wish to make edits, by all means, fork the repo and make your edits in your own copy of the repo.
