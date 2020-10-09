#!/bin/bash

# The app needs to communicate with databases. Here, we are starting those up. 
# The goal of this script is to startup all services and not exit until they are ready to connect. 

set -e

. bin/log.sh

POSTGRES_NAME='dev-postgres'
REDIS_NAME='dev-redis'
OUTPUT="/tmp/dev_setup.log"

function clearDatabases() {
    logVerbose "Clearing postgres database..."
    docker stop "$POSTGRES_NAME" >> $OUTPUT 2>&1 || true && docker rm "$POSTGRES_NAME" >> $OUTPUT 2>&1 || true

    logVerbose "Clearing redis database..."
    docker stop "$REDIS_NAME" >> $OUTPUT 2>&1 || true && docker rm "$REDIS_NAME" >> $OUTPUT 2>&1 || true

    logSuccess "Databases cleared.\n"
}

function isDockerRunning() {
    if [[ $(docker ps -f "name=$1" --format '{{.Names}}') == $1 ]]
    then 
        true 
    else 
        false 
    fi
}

# I created this block below to enforce that you set the minikube docker daemon running with skaffold. 
# We need minikube to use a specific docker daemon so that when skaffold builds docker images, we don't need to push to 
# a remote docker registry and pull from there. Skaffold will find a locally built image to deploy. 
# But, after running skaffold with debug logging, I see that skaffold runs this command for you internally so there is no use. 
# if [[ "$MINIKUBE_ACTIVE_DOCKERD" != "minikube" ]]; then
#     printf "${RED}ERROR: Run command: eval \$(minikube -p minikube docker-env)\n"
#     printf "${WHITE}...then try again\n"
#     exit 1
# fi 

cp /dev/null $OUTPUT

cat << EOF
##################################################################
#                   Dev setup starting up...                     #
#     If you want to better understand what this script does,    #
#         read the docs/DEV.md document in this project.         #
##################################################################
EOF

logSuccess "Note: Server will be available at localhost:5000 once it is up!"
logVerbose "Full script output located at $OUTPUT. In case of an error, check out that file."

sleep 3

log "Do you want to clear the current dev databases?"
select yn in Yes No
do 
case $yn in
    Yes ) clearDatabases && break;;
    No ) break;;
esac
done 

# We want to keep dependencies low. So, we are not requiring that you have docker compose installed, just docker. 
logVerbose "Starting up Postgres database..."
isDockerRunning $POSTGRES_NAME || docker run -d --name "$POSTGRES_NAME" -p 5432:5432 --env-file app/.env postgres:12-alpine >> $OUTPUT 2>&1
logSuccess "Postgres up sucessfully \n"

logVerbose "Starting up Redis database..."
docker build -t "$REDIS_NAME":latest -f docker/Dockerfile-redis docker/ >> $OUTPUT 2>&1
isDockerRunning $REDIS_NAME || docker run -d --name "$REDIS_NAME" -p 6379:6379 "$REDIS_NAME":latest >> $OUTPUT 2>&1
logSuccess "Redis up successfully \n"

logVerbose "Creating Postgres schema through database migration..."
MAX_TRIES=10 DATABASE_HOST=localhost ./bin/loop.sh npm run db:migrate >> $OUTPUT 2>&1
logSuccess "Migration successful \n"

# Now that our databases are up and ready for connections, let's startup our application. 
logVerbose "Starting up development server..."
skaffold dev --port-forward 