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

- When the application server starts, set the constant value by reading the file once. Do not re-set the constant value another time.
- Have your application read from this constant value, only.

This works good for config files that are the same for each Kubernetes pod. When you have values that change and need to be shared between all pods, share this data in Redis.

### Avoid Promise reject

`Promise.reject` and `.catch()` exist so that you can handle when Errors happen in your code. In this application, we want to avoid using these. Rejected Promises should be reserved for when things go very bad. When the state of our application is in a place where it can no longer perform.

> Note: It's in special places like `app/start.ts` that we want to use `catch()` and have failures because if there is an error that happens in app startup, we want the app to crash and not continue.

In our application, there are many tasks like performing HTTP requests and performing database queries where something could go wrong and we need to react to it. If `.catch()` is only used when something goes very wrong, is unexpected, and can no longer perform then that would be a bad time to use it.

For the scenarios like this, have the return type be `Promise<Result<Type>>` where `Type` is the dt type that you are resolving in the `Promise`. The `Result` data structure (located in `app/types/result.ts`) is very simple where it can either be a successful result or Error.

When code (such as a controller) calls a function that returns a `Promise<Result<Type>>`, it's up to the caller to handle the `Result` and behave accordingly.

### Avoiding circular dependencies

In nodejs development where you are doing lots of `import ... from ...` statements, circular dependencies are prone to happen to your code. Circular dependencies can cause lots of issues including issues that are hard to diagnose. You will not get an error message saying, "You have a circular dependency, please fix it" you will get error messages like, "TypeError: Class extends value undefined is not a constructor or null". These messages are hard to diagnose!

##### What are circular dependencies?

Let's say that you have file `Pet.ts` and a file `Human.ts`.

```typescript
// Human.ts file
import { Pet } from "./pet"

export interface Human {
  name: string
  pet: Pet
}

// Pet.ts file
import { Human } from "./human"

export interface Pet {
  name: string
  owner: Human
}
```

Each time that you have an `import` statement in your code, nodejs opens that file and executes all of the code in the file. Looking at the code above, If we execute the `Human.ts` file, it sees the Pet file import where node will execute the `Pet.ts` file. When the Pet file runs, node sees the import statement at the top and executes the Human file, ......are you starting to see a pattern here? It's like an infinite loop. This is a circular dependency.

This example is easy to find and easy to fix because it's from one file to another: `Human -> Pet -> Human`. But, sometimes there are circular dependencies that are more difficult to find:

```typescript
// Person.ts file
import { Food } from "./food"

export interface Person {
  favoriteFood: Food
}

// Food.ts file
import { GroceryStore } from "./grocery_store"

export interface Food {
  name: string
  store: GroceryStore
}

// GroceryStore.ts file
import { Person } from "./person"

export interface GroceryStore {
  employees: Person[]
}
```

This is harder to see, but it's still a circular dependency: `Person -> Food -> GroceryStore -> Person`

##### How to fix circular dependencies?

I have found that I get circular dependencies the most when my modules are importing Typescript types from files. I find this is because importing Typescript types is a common pattern.

You might have a file like this:

```typescript
// index.ts
export interface Model {
  name: string
}

export abstract class BaseModel implements Model {}

export * from "./user_model"
```

And then the User Model module importing the `Model` type:

```ts
// user_model.ts
import { BaseModel } from "./index"

export class UserModel extends BaseModel {}
```

This is a circular dependency: `UserModel -> Model -> UserModel`. Even though the `index.ts` file is not importing the UserModel module, it is importing it with the line `export * from "./user_model"`. An export is still importing!

A common pattern that I like to use is create separate files for my Typescript types that do not import any other code but maybe other types. So, that means to take lots of the code from `index.ts` out of the file and put it somewhere else:

```ts
// model.ts
export interface Model {
  name: string
}

export abstract class BaseModel implements Model {}

// index.ts
export * from "./model"
export * from "./user_model"

// user_model.ts
import { BaseModel } from "."

export class UserModel extends BaseModel {}
```

Notice that we made the `model.ts` file that is pretty simple. It only defines some basic types with no imports. No circular dependencies anymore. Moving types into their own files fixes most problems I have found.

Another place that I see circular dependencies being common is when using `DI.inject(Dependency.X)` in your code. That is because the file `di/index.ts` has _lots_ of import statements inside of it which means there are lots of opportunities for circular dependencies. Avoid this by only using `DI.inject(Dependency.X)` in places like in `app/routes/` code or `healthcheck.ts` Those places are good places but other code like controllers, jobs, those should all by put in the dependency graph and use it's constructor to get all of it's dependencies.

##### Find circular dependencies

Luckily, there is [a handy tool](https://github.com/pahen/madge) you can use to _help_ find circular dependencies in the code.

> Note: This is just a tool. It may not find all issues and it may find false positives. Use it as a tool for help but know there may still be issues.

You want to try and check for circular dependencies against your Typescript code _and_ your compiled Javascript code. Both will give different results!

Check your Typescript code:

```
npx madge --circular --extensions ts app
```

Once you fix all of the issues, check your Javascript code:

```
npm run build && npx madge --circular dist
```
