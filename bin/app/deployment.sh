#!/bin/bash

set -e

API_VERSION=$(head -1 Versionfile)

# Edit the variables below. 
SERVER_CODE_LOCATION="~/API"
AWS_IMAGE_NAME="697751412711.dkr.ecr.us-east-1.amazonaws.com"
BETA_IMAGE_NAME="$AWS_IMAGE_NAME/curiosityio/api:beta-$API_VERSION"
PROD_IMAGE_NAME="$AWS_IMAGE_NAME/curiosityio/api:prod-$API_VERSION"

DEPLOY_USER=$BETA_DEPLOY_USER
DEPLOY_HOST=$BETA_DEPLOY_HOST
GIT_COMMIT='$(git rev-parse HEAD)'
ENV_IMAGE_NAME=$BETA_IMAGE_NAME
MIGRATION="beta"
EXTRA_DOCKER_COMPOSE_ARGS=""

# Set the correct variable
if [ $1 = "prod" ]; then
  DEPLOY_USER=$PROD_DEPLOY_USER
  DEPLOY_HOST=$PROD_DEPLOY_HOST
  ENV_IMAGE_NAME=$PROD_IMAGE_NAME
  MIGRATION="prod"
  EXTRA_DOCKER_COMPOSE_ARGS="-f docker/app/docker-compose.prod.override.yml"
fi

COMMANDS=$(cat <<-EOF
cd $SERVER_CODE_LOCATION
git fetch
git checkout $GIT_COMMIT 
eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1|tr -d '\r')
docker pull $ENV_IMAGE_NAME
docker stop app
docker rm -f app

./node_modules/.bin/sequelize db:migrate --debug --env "${$MIGRATION}"

docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.beta.override.yml $EXTRA_DOCKER_COMPOSE_ARGS up -d

EOF
)

# Deploy new API to server. 
ssh $DEPLOY_USER@$DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no '$COMMANDS'

exit 0
