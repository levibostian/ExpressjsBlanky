import { Project } from "../app/type/project"

/**
 * This file is where we add our own modifications to existing typescript definitions. This is known as *declaration merging*: https://www.typescriptlang.org/docs/handbook/declaration-merging.html. This is not where I define my own types. That's in 'app/types/' where I store those usually. I create actual Typescript interfaces there to use in my source code. Here is where I modify 3rd party node_modules. 
 * 
 * If you want to create custom type definitions for a node_module and overwrite the module's actual definitions, create those definitions in: `@types/name_of_module/index.d.ts` and the compiler will use these definitions only. It will not merge them. 
 * 
 * This can be difficult to get working. If you do anything wrong, the Typescript compiler will throw compilation errors saying types cannot be found. Here are some tips that I found to get this working successfully. 
 * 
 * If I put these declarations in @types/express/index.d.ts, these declarations don't merge but they instead replace all express declarations. This means that no 'express' import statements in our source code will work unless it's what is declared in this file. I am assuming that this is because I am using the nodejs module declaration pattern in the file manager: express/index.d.ts. That means I am overriding the official express module's type declarations. 
 * 
 * If I put these declarations in @types/express/custom.d.ts, these declarations will not be used in compilation. The compiler will simply not find them. I am guessing that this is only because with nodejs modules and that the file is not named index. 
 * 
 * If I do not include `declare global {}`, I cannot import my own types and use them in these declarations. The Typescript compiler will not find my app's own types I am trying to import. I am guessing this is because when I try to use a type while inside of a namespace:
 * ```
 * namespace Express {
 *   export interface Request { // Request found because it's part of the Express namespace. 
 *     foo: Foo // My own interface, `Foo`, is not found because it's looking in the Express namespace. 
 *   }
 * }
 * ```
 * 
 * There is a lot of confusion over the tsconfig.json file to get this to work. Here is part of mine:
 * ```
 * {  
  "compilerOptions": {
    ...
    "paths": {
      "*": ["node_modules/*", "@types/*"]
    },
    "typeRoots": ["@types", "./node_modules/@types"]
  },
  "include": ["app/**\/*", "@types/**\/*"] // if you see `/\*` ignore the `\`. It's only there to make the javsscript comment block happy. 
  }
  * ```
 */

declare global {
  namespace Express {
    export interface Request {
      project: Project
    }
  }
}
