# Workflow 

A *workflow* is a set of processes that you and your team follow in order to build, test, and deploy your application. Processes are put into place to help you and your team have success with working together. 

This project has an opinionated workflow you need to follow. Here are the steps to take and things the workflow can do for you. 

# Development workflow 

This is the workflow that all developers should be following. No matter if you want to fix a bug, create or edit a feature, follow this workflow. 

> Tip: Follow [this document](DEV.md) to learn about how to setup your machine for development of this project. 

1. Create a new branch with git. 
2. For each commit that you make, you must write each commit message using a special format. See [this document](https://gist.github.com/levibostian/71afa00ddc69688afebb215faab48fd7) to learn about this format. 
3. When you're all done with your work, make a pull request on GitHub into the `master` branch. 
4. When the pull request is merged in, done! Repeat the process over again. 

# Environments 

This project is setup with different environments. Check out [this document](ENV.md) to learn more about them. 

Here are instructions to deploy to each of the environments. 

### Deploying to testing environment workflow 

The testing environment is meant to be deployed to often. Every bug fix, every feature, every change your team makes should be deployed to the testing environment so that you can QA test it. 

This project is designed to deploy to the testing environment for you automatically each time that you merge a pull request into the `master` branch. You know this deployment was successful when there is a new git tag deployed to GitHub for you. 

### Deploying to production workflow 

The production environment is customer facing. Because of this, deploying your application to production should be a manual process that is performed when you and your team decide that your code base is stable and ready to go to production. 

Here are the steps to take:
1. Test your application against the testing environment. Once you have determined that it's stable, you are ready to deploy to production. 
2. Get the version of the software you want to deploy. You can perform a HTTP GET request to `/version` on the testing environment to get the version. Or, call `helm list` to see the version that is deployed. 
3. On your machine, checkout the git tag for that version: `git checkout X.X.X`. 
4. Create a new branch off of this tag and push it up: `git checkout production-deploy; git push -u origin production-deploy` 

This special branch, `production-deploy`, is designed to do a production deployment. 
