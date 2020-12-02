#!/bin/bash

# Job of this script is:
# 1. Install all dependencies and prepare for making a deployment to any environment. 
# 2. If a release is going to be made, trigger that. 

set -e

. bin/log.sh
. bin/require.sh

logVerbose "Docker login"
echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" --username "$DOCKER_USERNAME" --password-stdin
logSuccess "Docker login"

logVerbose "Installing dependencies"
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && sudo install skaffold /usr/local/bin/
sudo snap install kubectl --classic
sudo snap install helm --classic
logSuccess "Installing dependencies"

if [[ -z "${MAKE_RELEASE}" ]]; then
    logVerbose "Skipping making a release"
else 
    logVerbose "Making a new release"
    npm i @semantic-release/git @semantic-release/npm @semantic-release/github @semantic-release/changelog @semantic-release/exec && npx semantic-release
fi 

# Note: Try not to run anything after running semantic-release because sometimes we don't want to make a deployment (just a docs update). Therefore, let semantic-release execute the command to run the deployment. 