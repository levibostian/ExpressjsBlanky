#!/bin/bash

set -e

API_VERSION=$(head -1 Versionfile)

# Edit the variables below. 
AWS_IMAGE_NAME="697751412711.dkr.ecr.us-east-1.amazonaws.com"
BETA_IMAGE_NAME="$AWS_IMAGE_NAME/curiosityio/api:beta-$API_VERSION"
PROD_IMAGE_NAME="$AWS_IMAGE_NAME/curiosityio/api:prod-$API_VERSION"

# Set the correct variable
[[ $1 = "prod" ]] && ENV_IMAGE_NAME="$PROD_IMAGE_NAME" || ENV_IMAGE_NAME="$BETA_IMAGE_NAME"

npm install

# Build the image
docker build -f Dockerfile-prod -t docker-production-image-test .

# Test the newly built image
docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.prod-test.override.yml up -d; sleep 10
curl --retry 10 --retry-delay 5 -v localhost:5000/

# Push newly built image to AWS.
docker tag docker-production-image-test $ENV_IMAGE_NAME
eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
docker push $ENV_IMAGE_NAME
