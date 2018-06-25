#!/bin/bash

set -e

(
  ssh $PROD_DEPLOY_USER@$PROD_DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/YourName-API
    docker-compose -f docker-compose.yml -f docker-compose.beta.override.yml -f docker-compose.prod.override.yml up -d
EOF
)

exit 0
