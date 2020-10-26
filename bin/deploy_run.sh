#!/bin/bash

set -e

. bin/log.sh

NEXT_VERSION=$1 

logSuccess "Updating app to version $NEXT_VERSION"

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

logVerbose "Updating helm chart version"
sed -i '' "s/\(version: .*\)/version: $NEXT_VERSION/g" charts/Chart.yaml
logVerbose "Testing helm chart version update worked..."
cat charts/Chart.yaml | grep $NEXT_VERSION # checks if next version is found in the chart file. 
logSuccess "Updating helm chart version"

logVerbose "Performing database migration"
npx sequelize db:migrate --debug
logSuccess "Performing database migration"

logVerbose "Deploying application"
PROJECTS=$(cat app/config/projects.json | base64) DOTENV=$(cat .env | base64) IMAGE_TAG=$NEXT_VERSION; skaffold run
logSuccess "Deploying application"

