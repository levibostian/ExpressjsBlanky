# Setup

This document is meant to be a document you only need to use one time. It's the document that you use to take the [ExpressjsBlanky](https://github.com/levibostian/ExpressjsBlanky/) project and turn it into your own project. This includes getting your staging and production servers up and running and getting your code base ready for you and your team to develop with.

Follow the instructions below.

- Run these commands

```
git clone https://github.com/levibostian/ExpressjsBlanky.git NameOfYourNewApp
cd NameOfYourNewApp
rm -rf .git/
git init
git config user.email "you@example.com"
git config user.name "First Last"
git add .; git commit -m "Initial commit. Created project from levibostian/ExpressjsBlanky boilerplate.";
npm install

# install git hooks
./hooks/autohook.sh install
```

- Lastly, to get the app to compile you need to create some files that are hidden by default because they may contain sensitive information.

```
cp .env.example .env
cp app/config/projects.json.example app/config/projects.json
```

> This project uses [cici](https://github.com/levibostian/cici/) to maintain sensitive information. Check out the project to learn how to use it.

- Delete the LICENSE file if you're writing closed source: `rm LICENSE`
- Go into `README.md` and delete the following sections:
  - Contribute
  - What are the goals of ExpressjsBlanky?
  - The very top of the file where you see the name _ExpressjsBlanky_ and a few other sentences saying the project is boilerplate, delete all of that and rename it to the name of your app.

You can keep the rest of the docs the way they are. They are written in a way that future developers of your project can read it and be able to get up and running.

# Firebase

This project uses Firebase to do various tasks like sending push notifications to mobile devices and creating dynamic links that users can open up in the mobile app. This means that you need to create a Firebase project and enter your API keys and other secrets into this project.

> Note: Read the document [Notes](./NOTES.md) to learn more about how this project is setup with projects. This is important in order to configure your 1+ Firebase projects in this app.

Follow these steps to get your Firebase project working with this project:

1. Create a new Firebase project if you have not already for your mobile app.
2. In `Project Settings > General` you will find the _Web API Key_. That value goes inside of `app/config/projects.json` under the key `firebase_web_api_key`.
3. In `Project Settings > Service Accounts > Firebase Admin SDK` click `Create service account`. This will give you a .json file to download to your computer. Copy the contents of this file and paste it into the `app/config/projects.json` file under the `firebase_project` key.
4. Open the Dynamic Links feature in the Firebase console. If you haven't yet, click "Get started" and "New Dynamic Link". This will create a URL that you will use to generate dynamic links. Put this dynamic link URL in `app/config/projects.json` under the key `dynamic_link_hostname`.
5. In `app/config/projects.json`, set the package name/bundle ID of your mobile app in the `mobile_app_bundle` key. It's assumed that you make your Android and iOS apps both share the same value for the package name/build ID to make life easier.

# Database servers

We run our application web server in Kubernetes but we run our staging and production databases on a Linux Debian server. There are initiatives happening to try and get databases running in Kubernetes but I am currently not interested in those solutions. Databases are a _stateful_ application where my web server is _stateless_. Stateless applications can be destroyed and re-created without a care in the world. From a little reading I have done on the topic, it's still recommended to run a database on a traditional Linux server or on a database-as-a-service such as the one offered by [DigitalOcean](https://www.digitalocean.com/products/managed-databases/).

This project includes instructions on how to setup a Postgres and a Redis database on a Debian Linux server. That is the setup that I run with because it's cost effective. Database-as-a-service makes sense for a larger scale application but for small projects that are just getting developed right now, it can be pricy. Staging Postgres + Staging Redis + Production Postgres + Production Redis = $60 USD/mo. What we are doing is going to be $20 USD/mo ($10 production server, $5 staging server, \$5 block storage for backups).

Read [this document](./SERVER.md) to get your servers created and setup.

# Kubernetes

Our application web server runs on Kubernetes. Running your application in containers [is a very smart way to go](https://www.youtube.com/watch?v=u8dW8DrcSmo) and Kubernetes makes that job even easier.

Read [this document](./K8S.md) to get your Kubernetes cluster created and setup.

# Private Docker image registry

We compile Docker images and store them privately in a private image registry. Check out [the doc](./PRIVATE_DOCKER_REGISTRY.md) to setup the registry.

# .env

Now that you have servers and a cluster made, you can configure your code base to connect to this new infrastructure of yours. To do that, we edit the `.env` file. Because we use the tool `cici` to securely store secrets in our code base, you will want to edit the `.env` files inside of the `_secrets` directory.

> Tip: Read the [env](./ENV.md) document to learn more about environments.

It's recommended that you create a `.env` for (1) production (2) testing (3) running tests and development. 3 in total.

Check out `.env.example`. It has comments on the file explaining each piece for you to fill out.

After you create each of the `.env` files, [encrypt these secrets using `cici`](https://github.com/levibostian/cici/#getting-started).

# Compile

Time to try and run your app! Follow the steps in [the development doc](./DEV.md) to see if you can get the application running on your machine. This is a good sign that you have setup everything correctly.
