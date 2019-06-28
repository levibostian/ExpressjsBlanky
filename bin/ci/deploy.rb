require 'trent'
require 'uri'

# Edit the variables below. 
aws_image_name = "12345.dkr.ecr.us-east-1.amazonaws.com"
staging_image_name = "#{aws_image_name}/curiosityio/app:staging-#{api_version}"
prod_image_name = "#{aws_image_name}/curiosityio/app:prod-#{api_version}"
honeybadger_deploy_local_user = "Team Name"
name_of_docker_application = "app"
##########################

ci = Trent.new()

api_version = File.open('Versionfile') {|f| f.readline}
application_directory_to_save_to_on_server = "~/#{ENV["TRAVIS_REPO_SLUG"].split("/").join("_")}"

deploy_user = ENV["STAGING_DEPLOY_USER"]
deploy_host = ENV["STAGING_DEPLOY_HOST"]
git_commit = ENV["TRAVIS_COMMIT"]
env_image_name = staging_image_name
env = "staging"
migration = env
extra_docker_compose_args = ""

# Set the correct variable
if (!ENV["TRAVIS_TAG"].end_with?("-staging"))
  deploy_user = ENV["PROD_DEPLOY_USER"]
  deploy_host = ENV["PROD_DEPLOY_HOST"]
  env_image_name = prod_image_name
  env = "production"
  migration = env 
  extra_docker_compose_args = "-f docker/app/docker-compose.prod.override.yml"
end
##############

ci.config_ssh(deploy_user, deploy_host)

docker_login_command = "eval \$(docker run --rm -i -e \"AWS_ACCESS_KEY_ID=#{ENV['AWS_ACCESS_KEY_ID']}\" -e \"AWS_SECRET_ACCESS_KEY=#{ENV['AWS_SECRET_ACCESS_KEY']}\" -e \"AWS_DEFAULT_REGION=#{ENV['AWS_DEFAULT_REGION']}\" -e \"AWS_DEFAULT_OUTPUT=#{ENV['AWS_DEFAULT_OUTPUT']}\" jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1)"

# Push newly built image to AWS.
ci.sh("npm run _production:build")
ci.sh("docker build -f docker/app/Dockerfile-prod -t #{env_image_name} .")
ci.sh(docker_login_command)
ci.sh("docker push #{env_image_name}")

# Deploy 
ci.ssh("mkdir -p #{application_directory_to_save_to_on_server};")
ci.ssh("scp -r /docker/ #{deploy_user}@#{deploy_host}:#{application_directory_to_save_to_on_server}/docker")
ci.ssh("scp -r CHANGELOG.md #{deploy_user}@#{deploy_host}:#{application_directory_to_save_to_on_server}/")
ci.ssh(docker_login_command)
ci.ssh("docker pull #{env_image_name}")
ci.ssh("docker stop #{name_of_docker_application}", :fail_non_success => false)
ci.ssh("docker rm -f #{name_of_docker_application}", :fail_non_success => false)

ci.sh("npx sequelize db:migrate --debug --env #{migration}")

ci.ssh("cd #{application_directory_to_save_to_on_server}/docker; API_VERSION=#{api_version} /opt/bin/docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.staging.override.yml #{extra_docker_compose_args} up -d")

# Honeybadger deploy
deploy_url = URI::encode("https://api.honeybadger.io/v1/deploys?"\
  "deploy[environment]=#{env}&"\
  "deploy[local_username]=#{honeybadger_deploy_local_user}&"\
  "deploy[repository]=git@github.com:#{ENV['TRAVIS_REPO_SLUG']}.git&"\
  "deploy[revision]=#{git_commit}&"\
  "api_key=#{ENV['TRAVIS_REPO_SLUG']}")

ci.sh("curl -ig \"#{deploy_url}\"")