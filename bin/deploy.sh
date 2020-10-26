#!/bin/bash

set -e

. bin/log.sh
. bin/require.sh

OUTPUT="/tmp/app_dev.log"

cp /dev/null $OUTPUT

logVerbose "Full script output located at $OUTPUT. In case of an error, check out that file."

logVerbose "Docker login"
echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" --username "$DOCKER_USERNAME" --password-stdin
logSuccess "Docker login"

logVerbose "Installing dependencies"
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && sudo install skaffold /usr/local/bin/
snap install kubectl --classic
logSuccess "Installing dependencies"

npm i @semantic-release/git @semantic-release/npm @semantic-release/github @semantic-release/changelog @semantic-release/exec && npx semantic-release
