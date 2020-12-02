#!/bin/bash

set -e

. bin/log.sh

NEXT_VERSION=$1 

logSuccess "Making release of software for version $NEXT_VERSION"

logVerbose "Updating helm chart version"
sed -i -e "s/\(version: .*\)/version: $NEXT_VERSION/g" charts/Chart.yaml
logVerbose "Testing helm chart version update worked..."
cat charts/Chart.yaml | grep $NEXT_VERSION # checks if next version is found in the chart file to test it's successful
logSuccess "Updating helm chart version"

logVerbose "Building sources"
npx install-subset install --npm build
npm run build
logSuccess "Building sources"

if [[ -z "${HONEY_BADGER_API_KEY}" ]]; then
    logVerbose "Skipping uploading source maps."
else
    logVerbose "Upload sourcemaps"
    for mapFile in `find dist -name "*.map" -type f`; do
        echo "Uploading source map file, $mapFile"
        sourceFile=${mapFile::-4}
        # Note: given a fake `minified_url` here as API requires a value set. This isn't a web app so we give a random value. 
        curl --silent --show-error --fail https://api.honeybadger.io/v1/source_maps \
            -F minified_url=https://example.com/assets/application.min.js \
            -F api_key="$HONEY_BADGER_API_KEY" \
            -F revision="$NEXT_VERSION" \
            -F source_map="@$mapFile" \
            -F minified_file="@$sourceFile"
    done
    logSuccess "Upload sourcemaps"
fi 

logVerbose "Removing sourcemaps"
find dist -type f -name '*.map' -delete
logVerbose "Files located in dist/ now:"
find dist -type f -name '*'
logSuccess "Removing sourcemaps"

logVerbose "Building and deploying Docker image"
IMAGE_TAG=$NEXT_VERSION skaffold build --file-output=skaffold_build.json
logSuccess "Building and deploying Docker image"

logVerbose "Packaging helm chart"
mkdir -p /tmp/helm-package/
helm package charts/ --destination /tmp/helm-package/ 
mv /tmp/helm-package/*.tgz /tmp/helm-package/helm-package.tgz # we need to put the file in a hard coded path so semantic release will understand. 
logSuccess "Packaging helm chart"
