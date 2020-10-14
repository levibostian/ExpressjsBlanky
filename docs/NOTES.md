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
