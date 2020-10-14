#!/bin/bash

set -e

. bin/log.sh
. bin/require.sh

OUTPUT="/tmp/app_dev.log"

cp /dev/null $OUTPUT

logVerbose "Full script output located at $OUTPUT. In case of an error, check out that file."

./bin/db_setup.sh

function runTests() {
    log "Running tests..."
    npx jest --runInBand --detectOpenHandles --forceExit --silent
}

function installJest() {
    log "Installing Jest..."
    npm install jest >> $OUTPUT 2>&1
    log "Jest installed successfully"
}

npx --no-install jest -v > /dev/null || installJest
runTests
