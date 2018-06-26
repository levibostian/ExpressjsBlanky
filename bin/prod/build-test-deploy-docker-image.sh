#!/bin/bash

set -e

API_VERSION=$(head -1 Versionfile)

npm install

# Build the image
docker build -f Dockerfile-prod -t curiosityio/api:docker-test .

# Test the newly built image
docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.prod-test.override.yml up -d; sleep 10
curl --retry 10 --retry-delay 5 -v localhost:5000/

# Push newly built image to AWS.
docker tag curiosityio/api:docker-test 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:latest
eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
docker push 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:latest

docker tag 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:latest 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:prod-$API_VERSION
docker push 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:prod-$API_VERSION
