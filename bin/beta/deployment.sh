#!/bin/bash

set -e

# Deploy new API to beta server. We are running the bash scripts on the actual server for better error handling. 
(
  ssh $BETA_DEPLOY_USER@$BETA_DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/YourCircle-Site
    git checkout development # Checkout development branch as we are calling ./bin/beta/deploy.sh on the beta branch PR so beta will not be up to date yet.
    git pull
    eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
    export BETA_API_VERSION=$(head -1 Versionfile)
    docker pull 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:beta-$BETA_API_VERSION
    docker stop app
    docker rm -f app

    ./node_modules/.bin/sequelize db:migrate --debug --env "beta"

    docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.beta.override.yml up -d
EOF
)

exit 0
