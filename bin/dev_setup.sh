#!/bin/bash

# The app needs to communicate with databases. Here, we are starting those up. 
# The goal of this script is to startup all services and not exit until they are ready to connect. 
# Note: We want to keep dependencies low. So, we are not requiring that you have docker compose installed, just docker. 

set -e

. bin/log.sh
. bin/require.sh
. bin/db_setup.sh

OUTPUT="/tmp/app_dev.log"

cp /dev/null $OUTPUT

require_kubectl
require_minikube
require_skaffold
require_database_dotenv

cat << EOF
##################################################################
#            Dev setup starting up...This script does:           #
# 1. Starts up a Postgres database                               #
# 2. Starts up a Redis database                                  #
# 3. Builds your application in a Docker container and deploys   #
#    it to your local minikube Kubernetes cluster.               #
#                                                                #
#     If you want to better understand what this script does,    #
#         read the docs/DEV.md document in this project.         #
##################################################################
EOF

logSuccess "Note: Server will be available at localhost:5000 once it is up!"
logVerbose "Full script output located at $OUTPUT. In case of an error, check out that file."

ask_to_clear_db
start_dbs

# Now that our databases are up and ready for connections, let's startup our application. 
logVerbose "Starting up development server..."
npm run build >> $OUTPUT 2>&1 # we need to build once to make sure there is a dist/ directory to copy into the Dockerfile
# Create secrets. We need to create secrets now before our application begins. 
#kubectl create secret generic app-config --from-file=app/config/projects.json --dry-run=client -o yaml | kubectl apply -f - >> $OUTPUT 2>&1
K8S_NAMESPACE=default PROJECTS=$(cat app/config/projects.json | base64) DOTENV=$(cat app/.env | base64) skaffold dev --port-forward 
