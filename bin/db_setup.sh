#!/bin/bash

# The app needs to communicate with databases. Here, we are starting those up. 
# The goal of this script is to startup all services and not exit until they are ready to connect. 
# Note: We want to keep dependencies low. So, we are not requiring that you have docker compose installed, just docker. 

set -e

. bin/log.sh
. bin/require.sh

POSTGRES_NAME='dev-postgres'
REDIS_NAME='dev-redis'

require_docker

function clearDatabases() {
    logVerbose "Clearing postgres database..."
    docker stop "$POSTGRES_NAME" >> $OUTPUT 2>&1 || true && docker rm "$POSTGRES_NAME" >> $OUTPUT 2>&1 || true

    logVerbose "Clearing redis database..."
    docker stop "$REDIS_NAME" >> $OUTPUT 2>&1 || true && docker rm "$REDIS_NAME" >> $OUTPUT 2>&1 || true

    logSuccess "Databases cleared.\n"
}

function dockerContainerNotExist() {
    if [[ $(docker ps -af "name=$1" --format '{{.Names}}') != $1 ]]
    then 
        true 
    else 
        false 
    fi
}

function isDockerRunning() {
    if [[ $(docker ps -f "name=$1" --format '{{.Names}}') == $1 ]]
    then 
        true 
    else 
        false 
    fi
}

function ask_to_clear_db() {
    log "Do you want to clear the current dev databases?"
    select yn in Yes No
    do 
    case $yn in
        Yes ) clearDatabases && break;;
        No ) break;;
    esac
    done 
}

function start_dbs() {
    logVerbose "Starting up Postgres database..."
    # A docker container may have already been created but it's just not running. Start it if that's the case. 
    dockerContainerNotExist $POSTGRES_NAME || docker start "$POSTGRES_NAME"
    # Create a new container if it's not running by now which means it does not exist. 
    isDockerRunning $POSTGRES_NAME || docker run -d --name "$POSTGRES_NAME" -p 5432:5432 --env-file .env postgres:12-alpine >> $OUTPUT 2>&1
    logVerbose "Creating Postgres schema through database migration..."
    # We are setting DATABASE_HOST to override the value set in .env file. The .env file might have a value like 'minikube.host' and we can't work with that. This script knows that the postgres DB is running on the local machine.
    MAX_TRIES=10 DATABASE_HOST=localhost ./bin/loop.sh npm run db:migrate >> $OUTPUT 2>&1
    logSuccess "Postgres up successfully \n"

    logVerbose "Starting up Redis database..."
    docker build -t "$REDIS_NAME":latest -f docker/Dockerfile-redis docker/ >> $OUTPUT 2>&1
    dockerContainerNotExist $REDIS_NAME || docker start "$REDIS_NAME"
    isDockerRunning $REDIS_NAME || docker run -d --name "$REDIS_NAME" -p 6379:6379 "$REDIS_NAME":latest >> $OUTPUT 2>&1
    logSuccess "Redis up successfully \n"
}
