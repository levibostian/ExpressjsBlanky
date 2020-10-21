#!/bin/bash

set -e

. bin/log.sh
. bin/require.sh
. bin/db_setup.sh

clearDatabases
start_dbs

function installJest() {
    logError "Jest is not installed."
    exit 1
}

npx --no-install jest -v > /dev/null || installJest

# Note: do not override environment variables here. Set in ./tests/setup.ts instead. 
BASE_TEST_COMMAND="npx --no-install jest --runInBand --detectOpenHandles --forceExit --silent"

if [[ $1 == "unit" ]]; then 
    log "Running unit tests..."
    eval "$BASE_TEST_COMMAND --testPathPattern=\".+tests/unit/.+.spec.ts\""
elif [[ $1 == "integration" ]]; then 
    log "Running integration tests..."
    eval "$BASE_TEST_COMMAND --testPathPattern=\".+tests/integration/.+.spec.ts\""
else  
    log "Running all tests..."
    eval $BASE_TEST_COMMAND
fi 