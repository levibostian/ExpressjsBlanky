#!/bin/bash

set -e

(
  ssh $DEPLOY_USER@$DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/ExpressjsBlanky
    git pull
    docker stop foo
    docker rm -f foo
    eval $(docker run -i -v $HOME/.aws:/home/aws/.aws jdrago999/aws-cli aws ecr get-login --region us-east-1|tr -d '\r')
    docker pull 1234567890.dkr.ecr.us-east-1.amazonaws.com/levibostian/foo:latest
    docker-compose -f docker-compose.yml -f docker-compose.staging.override.yml -f docker-compose.prod.override.yml up -d
EOF
)

exit 0
