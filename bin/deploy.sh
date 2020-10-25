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
curl -s https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh | bash && sudo install kustomize /usr/local/bin/
logSuccess "Installing dependencies"

logVerbose "Building sources"
npx install-subset install build
npm run build
logSuccess "Building sources"

# check if we should even do this. check if api key exists. if not, skip this part
if [[ -z "${HONEY_BADGER_API_KEY}" ]]; then
    logVerbose "Skipping uploading source maps."
else
    logVerbose "Upload sourcemaps"
    for mapFile in `find dist -name "*.map" -type f`; do
        echo "Uploading source map file, $mapFile"
        sourceFile=${mapFile::-4}
        curl https://api.honeybadger.io/v1/source_maps \
            -F api_key="$HONEY_BADGER_API_KEY" \
            -F revision="$TRAVIS_COMMIT" \
            -F source_map="@$mapFile" \
            -F minified_file="@$sourceFile"
    done
    logSuccess "Upload sourcemaps"
fi 

logVerbose "Removing sourcemaps"
find dist -type f -name '*.map' -delete
logSuccess "Removing sourcemaps"

npm i @semantic-release/git @semantic-release/npm @semantic-release/github @semantic-release/changelog @semantic-release/exec && npx semantic-release
