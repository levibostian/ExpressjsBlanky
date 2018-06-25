#!/bin/bash

set -e

(
  ssh $BETA_DEPLOY_USER@$BETA_DEPLOY_HOST -o ConnectTimeout=10 -o StrictHostKeyChecking=no <<-EOF
    cd ~/YourName-API
    docker-compose -f docker-compose.yml -f docker-compose.beta.override.yml up -d
EOF
)

exit 0
