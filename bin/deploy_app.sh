#!/bin/bash

# This script is meant to be run:
# 1. To deploy to production. Production does not need a helm release, just publish to production cluster. 
# 2. Deploy to testing after a release has been made. 

set -e

. bin/log.sh
. bin/require.sh

NEXT_VERSION=$(node -p "require('./package.json').version")
logVerbose "Starting deploy. tag: $NEXT_VERSION"

# Not running database migrations automatically. See: https://github.com/levibostian/ExpressjsBlanky/issues/52
# logVerbose "Performing database migration"
# npm run db:migrate:list 
# npm run db:migrate
# logSuccess "Performing database migration"

logVerbose "Deploying application"
PROJECTS=$(cat app/config/projects.json | base64) DOTENV=$(cat app/.env | base64) IMAGE_TAG=$NEXT_VERSION skaffold deploy --build-artifacts=skaffold_build.json
logSuccess "Deploying application"

if [[ -z "${HONEY_BADGER_API_KEY}" ]]; then
    logVerbose "Skipping honeybadger deployment notice."
else
    logVerbose "Honeybadger deployment notice"
    curl --silent --show-error --fail https://api.honeybadger.io/v1/deploys \
        -F api_key="$HONEY_BADGER_API_KEY" \
        -F deploy[environment]="$DEPLOY_ENV" \
        -F deploy[revision]="$NEXT_VERSION" \
        -F deploy[repository]="https://github.com/$GITHUB_REPOSITORY" \ 
        -F deploy[local_username]="ci-server"
    logSuccess "Honeybadger deployment notice"
fi 