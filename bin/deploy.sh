#!/bin/bash

set -e

. bin/log.sh
. bin/require.sh

logVerbose "Docker login"
echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" --username "$DOCKER_USERNAME" --password-stdin
logSuccess "Docker login"

logVerbose "Installing dependencies"
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && sudo install skaffold /usr/local/bin/
snap install kubectl --classic
snap install helm --classic
logSuccess "Installing dependencies"

if [[ -z "${MAKE_RELEASE}" ]]; then
    logVerbose "Skipping making a release"
else 
    logVerbose "Making a new release"
    npm i @semantic-release/git @semantic-release/npm @semantic-release/github @semantic-release/changelog @semantic-release/exec && npx semantic-release
fi 

NEXT_VERSION=$(node -p "require('./package.json').version")
logVerbose "Starting deploy. tag: $NEXT_VERSION"

logVerbose "Performing database migration"
npx sequelize db:migrate --debug
logSuccess "Performing database migration"

logVerbose "Deploying application"
PROJECTS=$(cat app/config/projects.json | base64) DOTENV=$(cat .env | base64) IMAGE_TAG=$NEXT_VERSION skaffold deploy
logSuccess "Deploying application"