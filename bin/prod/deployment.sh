#!/bin/bash

set -e

# Deploy new API to production server. We are running the bash scripts on the actual server for better error handling. 
(
  ssh $PROD_DEPLOY_USER@$PROD_DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/YourCircle-Site
    git checkout beta # Checkout development branch because this is the pull request to merge development branch
    git pull
    eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
    export PROD_API_VERSION=$(head -1 Versionfile)
    docker pull 697751412711.dkr.ecr.us-east-1.amazonaws.com/curiosityio/api:prod-$PROD_API_VERSION
    docker stop app
    docker rm -f app
    
    ./node_modules/.bin/sequelize db:migrate --debug --env "production"
    
    docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.beta.override.yml -f docker/app/docker-compose.prod.override.yml up -d
EOF
)

exit 0
