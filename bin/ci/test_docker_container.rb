require 'trent'

ci = Trent.new()

ci.sh('API_VERSION=$(head -1 Versionfile)')

# Build the image
ci.sh('docker build -f docker/app/Dockerfile-prod -t docker-production-image-test .')

# Test the newly built image
## First, startup the DB. We start it up separate because we need to sleep to allow it to create the schema and be ready before starting application. 
## I cannot use the /wait script that the dev and test images use because this is the built prod image. I want to not install the script there. 
ci.sh('docker network create test-docker-image')
ci.sh('npm run db:production; sleep 10')
ci.sh('npm run production; sleep 10')
ci.sh('docker logs app')
ci.sh('curl --retry 10 --retry-delay 5 -v localhost:5000/version')