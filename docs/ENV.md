# Env 

When developing server based code, a lot could go wrong. Your code incorrectly reads and writes to the database, your database migration is unsuccessful, you have authentication flaws. We are only human and there will be mistakes. 

There are many steps that you can take to minimize these risks. One of those steps to take is to setup multiple *environments*. Environments are instances of your application running for a different purpose to a specific set of users. 

**This project is configured to run on 2 environments. *Testing* and *Production*.**

**Environment is a fancy work that means we want to dynamically change some of our code at compile time**. For our testing environment, at compile time, we set the IP address that points to our database to a database that we use for testing purposes. At compile time for production, we set the IP address to a different value that points to the production database. 

# Using environment variables in project 

How do we make changes at compile time to our code based on the environment? **We use environment variables**. 

What is an environment variable? Environment variables are variables that change the behavior of your computer. Environment variables are used a lot in Windows, Linux, and macOS computers for example. If you open up your terminal on your Linux or macOS computer and type `echo $HOME`, it will return back a value to you. It returns the value of the environment variable `HOME`. If you were to logout of your computer, login to another user account you have setup on your operating system and enter `echo $HOME` again for this separate user, you will get a different value. These variables dynamically change the operating system depending on the logged in user.

Environment variables can be variables defined on your operating, yes, but environment variables can also be stored and loaded from a file. We call these `.env` files (pronounced "dot env") and this is the syntax of these files:

```
# This is a comment. 
VARIABLE_NAME=variable value

# You can define hostnames
STRIPE_API_HOSTNAME=https://api.stripe.com

# Define booleans. 
ENABLE_LOGGING=true

# Define numbers 
RETRY_POLICY_NUMBER=3

# Values can have spaces
APP_NAME=Puppy Fan Club
```

Pretty simple. Variable name, `=` character, then the value of that variable. 

If you followed the [Getting Started instructions in this project](../README.md#Getting-Started) it tells you to run the command `cp .env.example .env`. This command creates a file `.env` in your project used for the *development environment*. This file is read by the application during development. 

This project is already setup to use `.env` files. If you ever need to make changes to this `.env` file to add or remove variables, follow these steps:

1. Open your `.env` file in the root directory of your project and edit the file to make your changes. Make sure to also edit `.env.example` so that there is a good default value used for development. 
2. Edit the `app/env.ts` file. This file is the 1 and only file that all environment variables are read and shared with your app's code. 
3. Edit the `.env` files for each of your environments. See the section [How to manage .env files](#How-to-manage-.env-files) to learn how to do this. 

# When should I use an environment variable? 

The more that you add environment variables to your code, the harder everything is to manage. You don't want to go overboard on defining tons of environment variables. I follow the rule of only defining environment variables when I absolutely need one. 

In this document, we gave the example of dynamically changing the IP address that points to a database to use. That's a great example of a variable to define with an environment variable. The app is going to behave identically except what what database is used. 

That's very important. Make sure your app behaves identically as close as possible no matter what environment it is in. Your app should be dumb. It should not care at all what environment it is in. When you encounter bugs in your app, it is *way* easier to debug the errors when the app behaves identically no matter the environment. Trust me. You will catch more bugs during development and testing and you will be able to fix them faster when they happen in production. 

#### Some bad examples of when you would use environment variables would be:

* Enabling and disabling features of your app. 

Well, if you have a paid version of your app and a free version, this might be acceptable. But if you have a production environment and a development version of the same app you want to keep all of the features identical because during development when you're testing your app works correctly, you can feel confident that your app will work correctly because it is identical to the production app except some very small changes. If the app works during development, you can feel confident it will work at production. 

* Modifying critical behavior of your app. 

Let's say that we implement a retry policy into our app so that when the user encounters an error performing a HTTP network request we automatically perform a retry. Let's say we create an environment variable `NUMBER_RETRIES=3`. When we are developing, we define the value at `NUMBER_RETRIES=1` because it's annoying to wait longer for network requests during development but in production we define the value at `NUMBER_RETRIES=5`. During your development of the app, your network calls are super fast because if an error happens, it will only retry once. You develop the app and push it to the app store to your customers. Next thing you know, you start to get some bad reviews made in the app store from users saying that the app is slow and takes forever to load. If you set `NUMBER_RETRIES=5` in your development environment *and* production environment, you would have realized during development that the app loads slow. That would have been nice to know! The way to fix this is to choose a value for the number of retires and hard code that value into the code. Do not make it an environment variable. That way it will be that same way for all environments. 

Keep your critical behavior of your app identical. The app should behave identically no matter the environment. 

# How to manage .env files

When we compile our code, the compiler will use the `.env` file in the root directory of our project. We are supposed to have a separate `.env` file for every environment of our app. One `.env` for development, one `.env` for production, etc. 

How do we manage all of these separate `.env` files? Some people do something like this where they create multiple files: `.env.production`, `.env.development` and then before they compile their app, they run a command `cp .env.production .env` which copies the contents of the `.env.production` file and puts it into `.env` ready to compile for the production environment. 

Although this could work, it's not secure. What if we need to put secret passwords or private API keys into our `.env` file? Not all projects need this, but some might. It's bad practice to save passwords and other private information like API keys in your git version control repository. Even if your GitHub repository is set to private, it's still a bad idea to save these secrets there. 

So, how do we manage 1+ `.env` files and also store them in a secure way? 

This project uses a tool for that purpose called [cici](https://github.com/levibostian/cici/). cici is a program that stores files in your version control in a secure way and helps you manage them all. 

The best place to learn how to use cici is the [project documentation](https://github.com/levibostian/cici/). It's quick and simple to understand how to use it. 

A gist of how we use cici to manage our environments is:
* Define a *cici set* for all of our separate environments in our project. For example, define a set `production` and a set `development`. 1 set for 2 separate environments. 
* After you create all of your separate `.env` files for each of your environments, encrypt the files with `cici encrypt` on your machine. 
* Then, when you want to compile your production app, run `cici decrypt --set production` and compile your app. Done! 
