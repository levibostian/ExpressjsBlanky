#!/bin/bash

# The app needs to communicate with databases. Here, we are starting those up. 
# The goal of this script is to startup all services and not exit until they are ready to connect. 

set -ex 

# We want to keep dependencies low. So, we are not requiring that you have docker compose installed, just docker. 
APP=dev-postgres; docker stop "$APP"; docker rm "$APP"; docker run -d --name "$APP" -p 5432:5432 --env-file .env postgres:12-alpine

docker build -t dev-redis:latest -f docker/Dockerfile-redis docker/
APP=dev-redis; docker stop "$APP"; docker rm "$APP"; docker run -d --name dev-redis -p 6379:6379 dev-redis:latest

MAX_TRIES=10 ./bin/loop.sh npm run db:migrate