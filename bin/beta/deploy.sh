#!/bin/bash

set -e

(
  ssh $BETA_DEPLOY_USER@$BETA_DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/YourName-API
    git checkout development # Checkout development branch because this is the pull request to merge development branch
    git pull
    eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
    export BETA_API_VERSION=$(head -1 Versionfile)
    docker pull 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:beta-$BETA_API_VERSION
    docker stop app
    docker rm -f app
EOF
)

exit 0
