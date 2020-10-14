# Notes

These are notes by the developers, for the developers. Notes about the project that are good to know.

# Projects

This project has implemented this idea of _projects_. While building APIs, I have encountered a couple times when I needed to build an API that supported 2+ mobile apps. Maybe you have built white-labeled mobile apps or you are a company building an API that supports multiple separate apps. Each of these mobile apps that you support are separate _projects_ in this app.

Projects mostly exist because of using Firebase. We use Firebase to create dynamic links, send push notifications, and more. If you have multiple separate mobile apps that each use a separate Firebase project, you need a way to switch between them at runtime. Here is how they work.

The file `app/config/projects.json` is an Object where each key of the Object represents a separate project. This is the file that contains all of the separate configurations for each project. Think of it like the `.env` file is configuration for the global application and the `projects.json` file is configuration for each individual project.

This is how projects work in this project:

- The `projects.json` file is a Kubernetes secret.
- When the application starts up, it will read the `projects.json` file. It will parse the Object inside and (1) store all of the configuration in memory of the application to use later on.
- Every HTTP request that comes into the application will pass through a middleware. This middleware will check a header entry to select what project this HTTP request refers to. This middleware will attach the `Project` object to the Express Request object so you can refer to it easily with `req.project`.
- Pass the `Project` into your controllers and other files for the request. This will parse the configuration object and do it's work it needs.

# Best practices 

These are best practices that this project follows. Maybe not ones that all projects follow. 

### Read files once, store in cache

There are a couple of scenarios when the application reads a file from the file system. For example: reading config files. Reading files from the file system can be slow. It's faster if you read a file one time and then store the result in-memory in an exported constant to your application. See `app/projects.ts` for an example of this. 

> Note: Exported constants are something you don't want to do often because it's error-prone. However, doing it in these scenarios are less error prone if you follow the pattern of: 
* When the application server starts, set the constant value by reading the file once. Do not re-set the constant value another time. 
* Have your application read from this constant value, only. 

This works good for config files that are the same for each Kubernetes pod. When you have values that change and need to be shared between all pods, share this data in Redis. 

### Avoid Promise reject 

`Promise.reject` and `.catch()` exist so that you can handle when Errors happen in your code. In this application, we want to avoid using these. Rejected Promises should be reserved for when things go very bad. When the state of our application is in a place where it can no longer perform. 

> Note: It's in special places like `app/app_startup.ts` that we want to use `catch()` and have failures because if there is an error that happens in app startup, we want the app to crash and not continue. 

In our application, there are many tasks like performing HTTP requests and performing database queries where something could go wrong and we need to react to it. If `.catch()` is only used when something goes very wrong, is unexpected, and can no longer perform then that would be a bad time to use it. 

For the scenarios like this, have the return type be `Promise<Result<Type>>` where `Type` is the dt type that you are resolving in the `Promise`. The `Result` data structure (located in `app/types/result.ts`) is very simple where it can either be a successful result or Error. 

When code (such as a controller) calls a function that returns a `Promise<Result<Type>>`, it's up to the caller to handle the `Result` and behave accordingly. 