# ExpressjsBlanky

Clone the repo, edit some configurations, and get off to building your next awesome Nodejs!

This project is _very_ opinionated because, well, it's designed for the apps that [I](https://github.com/levibostian/) build.

iOS developer? I have [a boilerplate project for you!](https://github.com/levibostian/iosblanky)
Android developer? I have [a boilerplate project for you!](https://github.com/levibostian/androidblanky)

# What is ExpressjsBlanky?

ExpressjsBlanky is an Expressjs app running on Nodejs. It's a simple Expressjs app that includes a collection of libraries, configurations, and architecture decisions for all of the apps that I build. So whenever I want to build a new API, instead of creating a new Expressjs project and spending a bunch of time configuring it to include all my libraries, configurations, and architecture decisions in it that I want, I simply clone this repo, do some editing to the project, and off to building my app!

# Why use ExpressjsBlanky?

You know the feeling when you go to begin a new project. The day you begin a project is spent on just setting up your project, configuring it, and getting your environment all setup. It takes hours to days to complete!

ExpressjsBlanky works to avoid that. By having a blank Expressjs app already created, am able to copy it and am ready to jump right into developing my new app. ExpressjsBlanky works to get you to building your app within minutes instead of hours or days.

# What are some cool things about ExpressjsBlanky?

ExpressjsBlanky has been modified over years of building nodejs rest APIs. Through experience, you are guaranteed to find many annoyances and bugs. After each encounter, some engineering work is done to help remove that annoyance and prevent that bug from happening again.

ExpressjsBlanky comes equipped with the following features:

- Strongly typed programming language via Typescript. After years of runtime exceptions from Javascript, it's time for something better.
- Deploy a staging and production server of application. This allows you to perform internal and external beta testing of your APIs to make sure everything works great.
- ExpressjsBlanky is setup with dependency injection and mocking to allow you to unit test easily.
- When creating integration tests, it can be necessary to insert fake data into your database and then run a HTTP request against your code to test it. ExpressjsBlanky is setup to insert fake data into your database super easily.
- Run tests on each commit of your code, build and test your production docker container, and deploy your applications all by just pushing code to GitHub. All of this is done via ExpressjsBlanky being setup with a CI server.
- Database backups for production database.
- Run application in Docker for CI tasks and deployment - Makes deployment painless and portable.

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
npm run init
```

- Next, follow all of the directions below in the [services](#Services) section to configuring the services this project is setup to work with.
- When you want to run the application locally on your machine for development purposes, follow the directions for [development](#development).
- If you want to run unit, integration tests for your application, check out the section for [tests](#tests).
- If you wish to deploy your application to a staging or production server, check out the section on [deployment](#deploy).

Enjoy!

# What is included in ExpressjsBlanky?

### Language:

- [Typescript](https://www.typescriptlang.org/) compiled via [Babeljs](https://babeljs.io/).

### Libraries:

- [API doc](http://apidocjs.com/) - Generate documentation on each API endpoint for an API.
- [Axios](https://github.com/axios/axios) - For performing HTTP requests to other services within my API.
- [Bull](https://github.com/OptimalBits/bull) - Queue of jobs that are more heavy duty to run in the background of my API to not slow down my API requests for users.
- [Bull Arena](https://github.com/bee-queue/arena) - Web UI to view Bull jobs. Used primarily for debugging.
- [Connect trim body](https://github.com/samora/connect-trim-body) - Small middleware used to trim whitespace from all of the strings of a request body.
- [cors](https://github.com/expressjs/cors) - Middleware to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support, easily.
- [dotenv]() - Change your code at runtime easily by using environment variables.
- [Express](https://expressjs.com/) - The web framework used to create the API.
- [Express routes versioning](https://github.com/Prasanna-sr/express-routes-versioning) - Allows me to create versioning API endpoints. Used to scale an API while keeping backwards compatibility with existing apps built.
- [Express validator](https://github.com/express-validator/express-validator) - Validate request body/query for parameters I require for each endpoint.
- [Forever](https://github.com/foreverjs/forever) - Automatically restarts my nodejs app if it ever fails in production.
- [Helmet](https://github.com/helmetjs/helmet) - Middleware to add best practice, common, security protection to your API.
- [husky]() - Run commands during development when you run git commands. Very handy for auto formatting your code on git commits!
- [inversify]() - Dependency injection framework to make unit testing of your code nice and easy.
- [Passport](http://www.passportjs.org/) - Middleware for Basic and OAuth Bearer authentication (and many other authentication forms) to authenticate endpoints of my API.
- [Prettier]() - Code formatting to make your code prettier.
- [Sequelize](https://github.com/sequelize/sequelize) - Module to interact with the database. Makes all CRUD operations less prone to bugs instead of writing raw SQL strings.
- [uid2](https://www.npmjs.com/package/uid2) - Generate UID strings.

#### Testing libraries

- [Jest](https://jestjs.io/) - Testing framework.
- [Supertest](https://github.com/visionmedia/supertest) - Test HTTP requests easily. Makes creating integration tests against the API endpoints easy.

#### Database

I am a fan of [Postgres](https://www.postgresql.org/). Stable, SQL based database. I am using the [sequelize](https://github.com/sequelize/sequelize) npm module to interact with the database for all CRUD operations.

ExpressjsBlanky is setup to run Postgres for development, testing, staging, and production environments. Because the same database is always used, you can expect less issues at runtime in production.

# Services

- [Firebase Cloud Messaging (sending push notifications)](https://firebase.google.com/docs/cloud-messaging/admin/) - Send push notifications to Android or iOS apps from API.
  Configure:

1. Follow the directions for [Generating the .json file with your private keys](https://firebase.google.com/docs/admin/setup). _Note: Put the .json file in the path: `config/firebase_key.json`. The API is already configured to use that file and work from there._
2. Uncomment the initialization code in `jobs/send_push_notification_user.ts`.
3. Uncomment the push notification payload JSON in the bottom of `jobs/send_push_notification_user.ts` for Android and iOS specific payloads according to [the docs](https://firebase.google.com/docs/cloud-messaging/admin/send-messages).
4. Anytime you want to send a push notification to a user, use this code: `await jobQueueManager.queueSendPushNotificationToUser({...})`

- [Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links/) - Send URLs that can route your client applications to specific parts of your app.
  Configure:

1. If you want to use your own custom domain name for your dynamic links, [go to the Firebase Console to add your custom URL](https://console.firebase.google.com/project/_/durablelinks/links/).
2. If you use your custom domain or you use the generated URL that Firebase makes for you [in the Firebase Console](https://console.firebase.google.com/project/_/durablelinks/links/), you need to copy that URL and paste it in: `app/constants/index.ts`. Edit `login > dynamic_link_url` You will also want to add your Android package name and/or your iOS package name in the constants file if you have an Android or iOS app.

All of the query parameters you want to add to the dynamic link can be found [in these docs](https://firebase.google.com/docs/dynamic-links/create-manually).

- [Travis CI](https://travis-ci.com/) - CI server to run tests, build Docker images, push Docker images to AWS ECR, and deploy the pushed docker images to our server. Pretty much all automation that I can.
  Configure:

1. Create a [Travis](https://travis-ci.com/) account, and enable your GitHub repo for your API project in your Travis profile page.
2. I have setup the CI server workflow to follow a strict git workflow. It is as follows:

Features, bug fixes, any new work done on app are developed using a new git branch. ---> Merge work into `development` git branch using a GitHub pull request. After you have decided you want to create a beta release of the software that has been merged into the `development` branch, make a GitHub pull request from the `development` branch into the `beta` branch. If you find bugs in the beta build as you beta test, go ahead and simply start at the beginning of the cycle by creating a separate branch, merging it into `development` and then into `beta` again. ---> After you feel your `beta` deployment is production ready, create a GitHub pull request from `beta` branch into `production` branch to deploy to production.

To follow this workflow, create a git branch `development`, `beta`, and `production` and push those all up to GitHub. I _highly_ recommend to protect each of these 3 branches in the GitHub repo settings to make sure that only pull requests can update these branches instead of a push! You can also delete the `master` branch at this point and set the default branch to `development` in the GitHub repo settings as you will no longer be using the `master` branch.

- [Danger](http://danger.systems/ruby/) - Bot that looks over my pull requests and make sure I do not forget to complete certain tasks.
  Configure: [Here are instructions](http://danger.systems/guides/getting_started.html#creating-a-bot-account-for-danger-to-use) for adding a Danger bot to your repo. This depends on if your app is an open source or closed source project.

- [Postmark](https://postmarkapp.com/) - Sending emails to users.
  Configure:

1. Create an account [at Postmark's website](https://postmarkapp.com/). Add your domain name you want to send email from.
2. After all of your setup is complete, you will have an API key for the server you want to send from. _Note: It may be a good idea to create multiple servers in Postmark: One for staging and production, one for development. However, you do what you feel is best_.

Copy the example config files if you have not already:

```
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

Edit the environment variables in `.env.development`, `.env.production`, and `.env.staging` with your Postmark server's API key and the email address, name, you want to send emails from.

3. Create HTML templates in the Postmark website. You can include variables to make them dynamic!
4. Add or edit the functions in `app/email/index.ts`. Create 1 function for each type of email you want to send. Then, when you're ready to send an email, `await emailSender.sendWelcome(toEmailAddress, {variable_name_here: variableValue})`.

- [AWS ECR](https://aws.amazon.com/ecr/) - Host private Docker images built from the API codebase.
  Configure:

1. [Create an AWS account](https://aws.amazon.com/).
2. [Create a new repository for ECR](https://console.aws.amazon.com/ecs/home?region=us-east-1#/repositories/create/new) which is where you will store API Docker images. I recommend naming your repository with this convention: `nameOfYourCompany/nameOfYourProject`.
3. Open `bin/app/build-test-deploy-docker-image.rb` and `bin/app/deployment.rb`. Edit the variables at the top of the file: `AWS_IMAGE_NAME`, `STAGING_IMAGE_NAME`, and `PROD_IMAGE_NAME`. Once you have your server created where you will host your API code, you can also edit the `STAGING_DEPLOY_USER`, `STAGING_DEPLOY_HOST`, `PROD_DEPLOY_USER`, `PROD_DEPLOY_HOST` variables in the `.travis.yml` file.
4. Open up [AWS IAM to create a new user](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new?step=details). Name it something like `travis-ci` since we are creating a user for your CI server. Check `Programmatic access` checkbox. Click next. For attaching permissions, choose `Attach existing policy directly`, search for `AmazonEC2ContainerRegistryPowerUser` and attach that permission. You will get an access key and a password generated for you. Save this information! You cannot recover it. I usually use a password manager like Lastpass to save this information in it.
5. The access key and password generated for you in AWS IAM needs to be given to our Travis CI configuration. Follow [these directions](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml) to encrypt these sensitive keys and add them to your `.travis.yml` file. For the environment variable names that you use for encryption, use: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
6. Open up the file `docker/db/docker-compose.db-staging.override.yml` and `docker/db/docker-compose.db-production.override.yml` and edit the `image` entry at the top to the correct name of your Docker image created inside of AWS.

- [AWS S3](https://aws.amazon.com/s3/) - Store database backups of the production database.
  Configure:

1. [Create a new S3 bucket](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) which will store your database backup files. Click "Create bucket". Name it, then click "Next" through the rest of the questions.
2. Click on the name of the bucket you just created. Create a folder inside of it. Name it something like "api-db-backups".
3. Open up [AWS IAM to create a new policy](https://console.aws.amazon.com/iam/home?region=us-east-1#/policies$new). Open the JSON tab and paste the following:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::nameofbuckethere"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::nameofbuckethere/*"
            ]
        }
    ]
}
```

Replace `nameofbuckethere` above with the name of your bucket that you created before.

When asked what to name this policy, name of something like `name-of-project-s3-rw`.

4. Open up [AWS IAM to create a new user](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new?step=details). Name it something like `db-backups`. Check `Programmatic access` checkbox. Click next. For attaching permissions, choose `Attach existing policy directly`, search for `name-of-project-s3-rw` (or whatever you named your policy you created above) and attach that permission. You will get an access key and a password generated for you. Save this information! You cannot recover it. I usually use a password manager like Lastpass to save this information in it.
5. Edit the file `.env.production` file in the backups section. Backups are currently only enabled for the production database.

## Misc services setup

Besides the services listed above and how to configure them, there is some more setup you need to complete as well to get your application running successfully.

- Finish setting up passportjs. The API is designed to have endpoints designed for an administrator of your application to use. The admin endpoints are designed to authenticate with OAuth Bearer or Basic authentication using a hard coded password.

Open `.env.staging` and `.env.production` and edit `ADMIN_AUTH_PASSWORD` and `ADMIN_AUTH_TOKEN` to the hard coded Bearer and Basic password respectively you wish to use.

# Development

_Warning: Make sure to follow the [getting started](#getting-started) section to configure your project before you try and run it locally._

Do you wish to build and run this Expressjs application locally on your machine for development? Let's do it.

To develop with ExpressjsBlanky, you need Docker and Nodejs installed. That is it!

```bash
npm run init
npm run dev:setup
npm run dev
```

This will install everything you need, start up services such as Redis and Postgres, then start your node application.

To debug your code, this project is setup to work with VSCode's built-in debugger. All you need to do is run the "Local development debug" task in VSCode and done! It will even reset the debugger and recompile your code on code change.

# Tests

This project is setup to create and run unit and integration tests against your code base super easily. For information on how to _write_ tests, check out the `tests/` directory.

```bash
npm run init
npm run test:setup
npm run test
```

This will run all of your tests: unit and integration.

It's recommended that while you are developing your tests you use the [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VSCode extension for when you want to run or debug individual tests.

# Deploy

_Warning: Before you try and deploy your application, you need to follow the directions on getting your [development](#development) environment setup and the application running locally. Also, recommended [your tests](#testing) run and pass._

This project is setup to deploy your Nodejs application via a [Docker](https://www.docker.com/) container. It is also setup to run in either a "staging" or a "production" environment. Directions below are very similar between the production and staging versions. It is recommended to run these staging and production applications on separate servers in case your staging version has a bug and it crashes the server resulting in your production application going down as well.

- First off, we need to deploy our database. To do this, we need to setup the usernames and passwords for our database.

```bash
# First, we need to copy the environment variables file for the environment we want to deploy.
cp .env.staging.example .env.staging
# or if you want to deploy production, use the following:
cp .env.production.example .env.production

# Make sure you now go into the .env file you created and edit all the values.

# Next, deploy the database:
npm run db:staging #staging
npm run db:production #production
```

_Note: If you are running a production version of your database, make sure to view the documents on [database backups](#Backups) to set that up before you start up your database._

Run `docker logs db` anytime you wish to see if the database has started successfully. Check the logs in there to see if it looks good.

- Next it is time to start up your application.

First off, this project is setup to using a CI server to test, build, and deploy your application for you. After you configure it, your CI server will take care of all of this work for you. However, I will still include the directions below for how to deploy manually so you can setup your server for CI deployments.

First, create a docker network: `docker network create nginx-proxy-network`.

- Decide what URL you would like to host your application under. I usually use subdomains. `api.yourdomain.com` for production and `beta-api.yourdomain.com` for beta.
- Go into your DNS settings for your site (I prefer Cloudflare for instant propigation) and change your DNS for your subdomain you want to host your app under. We need this to get SSL running.
- Open the file `docker/app/docker-compose.beta.override.yml` for beta and `docker/app/docker-compose.prod.override.yml` for production. Edit the variables: `VIRTUAL_HOST` and `LETSENCRYPT_HOST` to your domain you are using to host your app.
- Build, test, and push the Docker image to AWS ECR. `./bin/app/build-test-deploy-docker-image.sh beta` and `./bin/app/deployment.sh beta` for a beta application and `./bin/app/build-test-deploy-docker-image.sh prod` and `./bin/app/deployment.sh prod` for production. You will need to set some environment variables on your system to get this to work successfully!

# DB migrations

- To create a migration file for sequelize, run command: `npm run db:migrate:create --name describe-migration-here`
- Open up this new migration file created under `migrations/` directory. Edit it to code that runs the migration. Check out [the docs](http://docs.sequelizejs.com/manual/tutorial/migrations.html) on how to program migration code.
- Run the migration: `npm run db:migrate:run --debug --env "staging"` for staging or change `"staging"` to `"production"` for production.

# Documentation

This API is uses [apidoc](http://apidocjs.com/) for API documentation.

It is pretty easy to use. View the [official docs](http://apidocjs.com/) on the templating language and generate them using `npm run generate:doc`. Docs are generated in the `doc/` directory.

# Backups

Database backups are configured for you already to dump daily and upload to AWS S3. Above in the [services](#Services) section, follow the directions for AWS S3 to configure database backups.

## Author

- Levi Bostian - [GitHub](https://github.com/levibostian), [Twitter](https://twitter.com/levibostian), [Website/blog](http://levibostian.com)

![Levi Bostian image](https://gravatar.com/avatar/22355580305146b21508c74ff6b44bc5?s=250)

## Contribute

ExpressjsBlanky is not open for contributions at this time. This project showcases _my_ preferred way to build a Expressjs app. If you wish to make edits, by all means, fork the repo and make your edits in your own copy of the repo.

I do make some exceptions for contributions. If you are wondering if your contribution is welcome, [create an issue](https://github.com/levibostian/expressjsblanky/issues/new) describing what you would wish to do.
