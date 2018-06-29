# ExpressjsBlanky

Nodejs API boilerplate project I use for all the rest API apps that I build. Clone the repo, edit some configurations, and get off to building your next awesome app!

This project is *very* opinionated. It is not designed with the best practices, common libraries, and design patterns for *the general public*. It's designed for the apps that [I](https://github.com/levibostian/) build.

iOS developer? I have [a boilerplate project for you!](https://github.com/levibostian/iosblanky)
Android developer? I have [a boilerplate project for you!](https://github.com/levibostian/androidblanky)

# What is ExpressjsBlanky?

ExpressjsBlanky is an Expressjs app running on Nodejs. It's a simple Expressjs app that includes a collection of libraries, configurations, and architecture decisions for all of the apps that I build. So whenever I want to build a new API, instead of creating a new Expressjs project and spending a bunch of time configuring it to include all my libraries, configurations, and architecture decisions in it that I want, I simply clone this repo, do some editing to the project, and off to building my app!

# Why use ExpressjsBlanky?

You know the feeling when you go to begin a new project. The day you begin a project is spent on just setting up your project, configuring it, and getting your environment all setup. It takes hours to days to complete!

ExpressjsBlanky works to avoid that. By having a blank Expressjs app already created, am able to copy it and am ready to jump right into developing my new app. ExpressjsBlanky works to get you to building your app within minutes instead of hours or days.

# What is included in AndroidBlanky?

### Language:

* ES6 Javascript compiled via [Babeljs](https://babeljs.io/) with [Flowtype](https://flow.org/) -  I love type systems. Flowtype helps me write better Javascript. 

### Libraries:

* [Axios](https://github.com/axios/axios) - For performing HTTP requests to other services within my API. 
* [Babel](https://babeljs.io/) - Enables me to use new features of Javascript, today. 
* [Bull](https://github.com/OptimalBits/bull) - Queue of jobs that are more heavy duty to run in the background of my API to not slow down my API requests for users. 
* [Bull Arena](https://github.com/bee-queue/arena) - Web UI to view Bull jobs. Used primarily for debugging. 
* [Connect trim body](https://github.com/samora/connect-trim-body) - Small middleware used to trim whitespace from all of the strings of a request body. 
* [cors](https://github.com/expressjs/cors) - Middleware to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) support, easily. 
* [Express](https://expressjs.com/) - The web framework used to create the API. 
* [Express routes versioning](https://github.com/Prasanna-sr/express-routes-versioning) - Allows me to create versioning API endpoints. Used to scale an API while keeping backwards compatibility with existing apps built. 
* [Express validator](https://github.com/express-validator/express-validator) - Validate request body/query for parameters I require for each endpoint. 
* [Forever](https://github.com/foreverjs/forever) - Automatically restarts my nodejs app if it ever fails in production. 
* [Helmet](https://github.com/helmetjs/helmet) - Middleware to add best practice, common, security protection to your API. 
* [Mustache](https://github.com/janl/mustache.js) - Inject variables into HTML files that are then emailed out to our users. 
* [Passport](http://www.passportjs.org/) - Middleware for Basic and OAuth Bearer authentication (and many other authentication forms) to authenticate endpoints of my API.
* [Sequelize](https://github.com/sequelize/sequelize) - Module to interact with the database. Makes all CRUD operations less prone to bugs instead of writing raw SQL strings. 
* [uid2](https://www.npmjs.com/package/uid2) - Generate UID strings. 
* [Winston](https://github.com/winstonjs/winston), [Winston Slacker](https://github.com/meerkats/winston-slacker) - Logger used for logging to console for development and Slack for beta/production releases. 
* [eslint](https://eslint.org/) - Linter for keeping the code consistent and helping me write better, less prone to bugs code. 

# Testing libraries 

* [Nock](https://github.com/nock/nock) - Mock HTTP calls for testing purposes when making HTTP requests to remote hosts.
* [Shouldjs](https://github.com/shouldjs/should.js/) - Assertions library for testing. 
* [Mochajs](https://mochajs.org/) - Testing framework. 
* [Supertest](https://github.com/visionmedia/supertest) - Test HTTP requests easily. Makes creating integration tests against the API endpoints easy. 
* [Blanket](https://github.com/alex-seville/blanket) - Report on test coverage. 
* [API doc](http://apidocjs.com/) - Generate documentation on each API endpoint for an API. 

# Database 

I am a fan of [Postgres](https://www.postgresql.org/). Stable, SQL based database. I am using the [sequelize](https://github.com/sequelize/sequelize) npm module to interact with the database for all CRUD operations. 

# Services

* [Firebase Cloud Messaging (sending push notifications)](https://firebase.google.com/docs/cloud-messaging/admin/) - Send push notifications to Android or iOS apps from API.
Configure: 

1. Follow the directions for [Generating the .json file with your private keys](https://firebase.google.com/docs/admin/setup). *Note: Put the .json file in the path: `config/firebase_key.json`. The API is already configured to use that file and work from there.* 
2. Uncomment the initialization code in `jobs/send_push_notification_user.js`. 
3. Uncomment the push notification payload JSON in the bottom of `jobs/send_push_notification_user.js` for Android and iOS specific payloads according to [the docs](https://firebase.google.com/docs/cloud-messaging/admin/send-messages).
4. Anytime you wnat to send a push notification to a user, use this code: `await new SendPushNotificationData(userId, "title", "message").add()`

* [Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links/) - Enable logging into your mobile app via passwordless login by having the backend API email your user a login token that is then exchanged with an access token.
Configure: 

1. If you want to use your own custom domain name for your dynamic links, [go to the Firebase Console to add your custom URL](https://console.firebase.google.com/project/_/durablelinks/links/). 
2. If you use your custom domain or you use the generated URL that Firebase makes for you [in the Firebase Console](https://console.firebase.google.com/project/_/durablelinks/links/), you need to copy that URL and paste it in: `app/controller/0.1.0/user.js`. Edit this line of code: 

```
const passwordlessLoginLink: string = `https://your_subdomain.page.link/?link=${loginLink}&apn=${androidPackageName}`
```

You will also want to add your Android package name and/or your iOS package name to the dynamic link too. 

All of the query parameters you want to add to the dynamic link can be found [in these docs](https://firebase.google.com/docs/dynamic-links/create-manually). 

* [Travis CI](https://travis-ci.com/) - CI server to run tests, build Docker images, push Docker images to AWS ECR, and deploy the pushed docker images to our server. Pretty much all automation that I can.
Configure: 

1. Create a [Travis](https://travis-ci.com/) account, and enable your GitHub repo for your API project in your Travis profile page.
2. I have setup the CI server workflow to follow a strict git workflow. It is as follows:

Features, bug fixes, any new work done on app are developed using a new git branch. ---> Merge work into `development` git branch using a GitHub pull request. After you have decided you want to create a beta release of the software that has been merged into the `development` branch, make a GitHub pull request from the `development` branch into the `beta` branch. If you find bugs in the beta build as you beta test, go ahead and simply start at the beginning of the cycle by creating a separate branch, merging it into `development` and then into `beta` again. ---> After you feel your `beta` deployment is production ready, create a GitHub pull request from `beta` branch into `production` branch to deploy to production. 

To follow this workflow, create a git branch `development`, `beta`, and `production` and push those all up to GitHub. I *highly* recommend to protect each of these 3 branches in the GitHub repo settings to make sure that only pull requests can update these branches instead of a push! You can also delete the `master` branch at this point and set the default branch to `development` in the GitHub repo settings as you will no longer be using the `master` branch. 

* [Danger](http://danger.systems/ruby/) - Bot that looks over my pull requests and make sure I do not forget to complete certain tasks.
Configure: [Here are instructions](http://danger.systems/guides/getting_started.html#creating-a-bot-account-for-danger-to-use) for adding a Danger bot to your repo. This depends on if your app is an open source or closed source project.

* [Mailgun](https://www.mailgun.com/) - Sending emails to users. 
Configure: 

1. Create an account [at mailgun's website](https://www.mailgun.com/). Add your domain name and set it up in Mailgun on the website. Get your domain's API key, paste that in the file `docker/app/docker-compose.beta.override.yml` for the variable `API_MAILGUN_API_KEY`. While you're at it, also edit the variables `EMAIL_FROM_DOMAIN`, `EMAIL_FROM_NAME`, `EMAIL_FROM_EMAIL_ADDRESS` to the domain, name, and email address you want to send email as in your application. 
2. Create an HTML file containing your email you want to send. I personally use [Mailchimp](https://mailchimp.com/) to create the template file (Mailchimp has an email builder where you can then download a .html file of that template). Download the .html file email template of yours and save it under `email/templates/` as a `.html` file.
3. In the `.html` file you downloaded, go inside and create variables for yourself. Anywhere you want some text injected into the file dynamically, create variables using [mustachejs](https://github.com/janl/mustache.js) template strings like this: `{{variable_name_here}}`, `{{user_email_address}}`. If you need your variable to be escaped (such as a URL), add a `&` before your variable name like this: `{{&download_link}}`. 
4. Time to send an email! In your code, import the email module with: `import {sendEmail} from '../../email'` and then send the email: `await sendEmail(user.email, "Subject here", "template_name_here.html", {variable_name_here: variableValue, other_variable_here: "dynamicString"})`. 

* [AWS ECR](https://aws.amazon.com/ecr/) - Host private Docker images built from the API codebase. 
Configure:

1. [Create an AWS account](https://aws.amazon.com/). 
2. [Create a new repository for ECR](https://console.aws.amazon.com/ecs/home?region=us-east-1#/repositories/create/new) which is where you will store API Docker images. I recommend naming your repository with this convention: `nameOfYourCompany/nameOfYourProject`. 
3. Open `bin/app/build-test-deploy-docker-image.sh` and `bin/app/deployment.sh`. Edit the variables at the top of the file: `AWS_IMAGE_NAME`, `BETA_IMAGE_NAME`, and `PROD_IMAGE_NAME`. Once you have your server created where you will host your API code, you can also edit the `BETA_DEPLOY_USER`, `BETA_DEPLOY_HOST`, `PROD_DEPLOY_USER`, `PROD_DEPLOY_HOST` variables in the `.travis.yml` file. 
4. Open up [AWS IAM to create a new user](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new?step=details). Name it something like `travis-ci` since we are creating a user for your CI server. Check `Programmatic access` checkbox. Click next. For attaching permissions, choose `Attach existing policy directly`, search for `AmazonEC2ContainerRegistryPowerUser` and attach that permission. You will get an access key and a password generated for you. Save this information! You cannot recover it. I usually use a password manager like Lastpass to save this information in it. 
5. The access key and password generated for you in AWS IAM needs to be given to our Travis CI configuration. Follow [these directions](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml) to encrypt these sensitive keys and add them to your `.travis.yml` file. For the environment variable names that you use for encryption, use: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. 
6. Open up the file `docker/db/docker-compose.db-beta.override.yml` and `docker/db/docker-compose.db-prod.override.yml` and edit the `image` entry at the top to the correct name of your Docker image created inside of AWS. 

* [Slack](https://slack.com/) - Instant messaging application for teams. I use Slack to notify me when errors happen on my API. App crashes result in sending a Slack message to me with the error message and stacktrace. 
Configure:

1. Create a [Slack team](https://slack.com/get-started). 
2. Open the [Slack apps directory](https://slack.com/apps). Search for "Incoming WebHooks". Select it. 
3. Select "Add configuration". Select the channel you wish to post the error messages to. Click "Add Incoming WebHook integration". 
4. You should receive a URL in the form: `https://hooks.slack.com/services/.../.../...`. Open the file: `docker/app/docker-compose.beta.override.yml` and edit the environment variable `SLACK_WEBHOOK_URL` to the URL you received. Edit `SLACK_CHANNEL` to the channel you wish to post the message to. Do not include the `#` character in this. 
5. When you get an error in production or beta, you will receive a Slack message. You will know if this is working when you deploy your application for the first time. You will get a notification telling you that your application has started. 

* [AWS S3](https://aws.amazon.com/s3/) - Store database backups of the production database. 
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
5. Open the file `docker/db/docker-compose.db-prod.override.yml`. There are a lot of environment variables you need to it. `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PREFIX`. These variables are all named to your access key and password for your new IAM account as well as the name of your bucket and the name of your folder you created (aka: prefix). `POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. These are how to authenticate with your postgres database. This information should match the configuration details you have in `config/config.json` for the production database connection. 

## Misc services setup

Besides the services listed above and how to configure them, there is some more setup you need to complete as well to get your application running successfully. 

* Finish setting up passportjs. The API is designed to have endpoints designed for an administrator of your application to use. The admin endpoints are designed to authenticate with OAuth Bearer or Basic authentication using a hard coded password. 

Open `docker/app/docker-compose.beta.override.yml` and edit `ADMIN_AUTH_PASSWORD` and `ADMIN_AUTH_TOKEN` to the hard coded Bearer and Basic password respectively you wish to use. 

*Note: This set password will be the same for beta and for production environments. If you want to have separate passwords, copy and paste:

```
- ADMIN_AUTH_PASSWORD=12345
- ADMIN_AUTH_TOKEN=12345
```

Into `docker/app/docker-compose.prod.override.yml` and edit the passwords there as well to set production specific values. 

# Getting started 

* First, clone this repo:

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

* Next, follow all of the directions above in the [services](#Services) section to configuring the services this project is setup to work with. 
* When you want to run the application locally on your machine for development purposes, follow the directions for [development](#development). 
* If you want to run unit, integration tests for your application, check out the section for [tests](#tests). 
* If you wish to deploy your application to a beta or production server, check out the section on [deployment](#deploy). 

Enjoy! 

# Development 

*Warning: Make sure to follow the [getting started](#getting-started) section to configure your project before you try and run it locally.*

Do you wish to build and run this Expressjs application locally on your machine for development? Let's do it. 

This project is setup to run the Expressjs application inside of a [Docker](https://www.docker.com/) container. This is awesome because it allows you to develop your Expressjs application without having to install any extra software packages and configure them. It's all compacted inside of a nice little Docker package. 

Pretty simple. To run the application: `npm run docker:dev:run`. That's it. 

# Debugging 

This project is setup to work with Nodejs's inspector feature. This makes it super easy to setup breakpoints for your API for dev and testing debugging. 

Here is how to debug your app during development:

* Open up Google Chrome on your machine. Other browsers might work, but Google Chrome is the only one that I know works for now. It has the built-in Nodejs dev tools toolset. 
* Enter `about:inspect` into the address bar and hit Enter. Once there, select `Open dedicated DevTools for Node`. 
* In the next window that appears, in the "Connection" tab, make sure that `localhost:9229`, `127.0.0.1:9229`, and `0.0.0.0:9229` are all added. I doubt you need each of them, but I add them all to make sure it works. 
* Start the development application with the commands: `npm run docker:dev:build`, and `npm run docker:dev:run`. When it runs, you should automatically attach to the debugger. In the Node Chrome DevTools, you should see in the "Sources" tab the ability to browse the source code of your app. You can set breakpoints, call your endpoints and hit the breakpoints. 

Debug your application during tests:

* Follow the directions above for debugging your app during development. Except instead of running the `npm run ...` commands to start up the development app, start up your tests using the commands: `npm run docker:test:build`, `npm run docker:test:run:debug`. 

# Tests 

This project is setup to create and run integration tests against your endpoints super easily. You can create and run unit tests as well. However, some of the design decisions made for setting up the testing environment is made for integration testing of the endpoints in mind. 

For information on how to *write* tests, check out `test/0.1.0/admin.js` and `test/0.1.0/user.js` for tests that are created and all passing at this time. They are great reference for you to check out how to create tests. 

The testing environment created for this project is super sweet (well, at least I think so 😊). Here are some of the features:

* Tests run inside of a Docker container. No dependencies you need to install or configuration on your machine to run them. 
* You can populate your testing database with dummy data super easily. One line of code in fact: `await tests.setupDb([User.newUserState().testData()])`. This inserts an entry into the User table with a predefined set of data and all foreign key dependencies also inserted to get future CRUD operations to succeed. This is super easy to extend on with your own models as well. Check out the `app/model/user.js` and `app/model/fcm_token.js` files to see the `TestData` functions setup. 
* Super quick debugger setup. See the directions [for debugging](#debugging) to learn how. 

In order to *run* tests, here is how we do that. Just as we development and deploy our application, running tests also happen inside of a [Docker](https://www.docker.com/) container. 

To run tests, it's simple. First, build the Docker image: `npm run docker:test:build`. Then, run the tests: `npm run docker:test:run`. If you ever want to run tests with Nodejs debugging, check out the [debugging](#debugging) section. 

# Deploy

*Warning: Before you try and deploy your application, you need to follow the directions on getting your [development](#development) environment setup and the application running locally. Also, recommended [your tests](#testing) run and pass.*

This project is setup to deploy your Nodejs application via a [Docker](https://www.docker.com/) container. It is also setup to run in either a "beta" or a "production" environment. Directions below are very similar between the production and beta versions. It is recommended to run these beta and production applications on separate servers in case your beta version has a bug and it crashes the server resulting in your production application going down. 

* First off, we need to deploy our database. To do this, open up the file `docker/db/docker-compose.db-beta.override.yml` and edit the environment variables: `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` to whatever you wish. After you edit these, make sure that you also go into the file: `config/config.json` and edit the username, password, database name to match what you set above. As far as the host, set that to the IP address of your server that you will be deploying your database to. 

*Note: If you are running a production version of your database, make sure to view the documents on [database backups](#Backups) to set that up before you start up your database.*

After you set this all up, you're ready to start up your database. If you want to deploy a *beta* version of your API, run `npm run docker:db:beta:run`. If you want to deploy a *production* version, run: `npm run docker:db:prod:run`. 

Run `docker logs db` anytime you wish to see if the database has started successfully. Check the logs in there to see if it looks good. 

* Next it is time to start up your application. 

First off, this project is setup to using a CI server to test, build, and deploy your application for you. After you configure it, your CI server will take care of all of this work for you. However, I will still include the directions below for how to deploy manually. You need to follow these directions below the **first time** to get your application setup to work with a CI server. Then, your CI server can work on it's own for you. 

First, create a docker network: `docker network create nginx-proxy-network`. 
* Decide what URL you would like to host your application under. I usually use subdomains. `api.yourdomain.com` for production and `beta-api.yourdomain.com` for beta. 
* Go into your DNS settings for your site (I prefer Cloudflare for instant propigation) and change your DNS for your subdomain you want to host your app under. We need this to get SSL running.
* Open the file `docker/app/docker-compose.beta.override.yml` for beta and `docker/app/docker-compose.prod.override.yml` for production. Edit the variables: `VIRTUAL_HOST` and `LETSENCRYPT_HOST` to your domain you are using to host your app. 
* Build, test, and push the Docker image to AWS ECR. `./bin/app/build-test-deploy-docker-image.sh beta` and `./bin/app/deployment.sh beta` for a beta application and `./bin/app/build-test-deploy-docker-image.sh prod` and `./bin/app/deployment.sh prod` for production. You will need to set some environment variables on your system to get this to work successfully! 

# DB migrations

* To create a migration file for sequelize, run command: `npm run db:migrate:create --name describe-migration-here`
* Open up this new migration file created under `migrations/` directory. Edit it to code that runs the migration. Check out [the docs](http://docs.sequelizejs.com/manual/tutorial/migrations.html) on how to program migration code.
* Run the migration: `npm run db:migrate:run --debug --env "beta"` for beta or change `"beta"` to `"production"` for production. 

# Documentation

This API is uses [apidoc](http://apidocjs.com/) for API documentation.

It is pretty easy to use. View the [official docs](http://apidocjs.com/) on the templating language and generate them using `npm run generate:doc`. Docs are generated in the `doc/` directory. 

# Backups

Database backups are configured for you already to dump daily and upload to AWS S3. Above in the [services](#Services) section, follow the directions for AWS S3 to configure database backups. 

## Author

* Levi Bostian - [GitHub](https://github.com/levibostian), [Twitter](https://twitter.com/levibostian), [Website/blog](http://levibostian.com)

![Levi Bostian image](https://gravatar.com/avatar/22355580305146b21508c74ff6b44bc5?s=250)

## Contribute

ExpressjsBlanky is not open for contributions at this time. This project showcases *my* preferred way to build a Expressjs app. If you wish to make edits, by all means, fork the repo and make your edits in your own copy of the repo.

I do make some exceptions for contributions. If you are wondering if your contribution is welcome, [create an issue](https://github.com/levibostian/expressjsblanky/issues/new) describing what you would wish to do. 