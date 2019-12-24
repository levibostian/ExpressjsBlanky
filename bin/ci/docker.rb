require 'trent'
require 'uri'

ci = Trent.new(:local => true)

$run_docker_container_command = "docker-compose -f docker/docker-compose.yml up --build -d"

def build_docker_image(ci, tag = "latest")
  ci.sh("docker build -f docker/Dockerfile -t #{ENV['DOCKER_APP_IMAGE_NAME']}:#{tag} .")
end

def test_docker_image(ci)
  build_docker_image(ci)
  ci.sh("npm run dev:setup")
  ci.sh("DATABASE_HOST=localhost #{$run_docker_container_command}")
  ci.sh("docker logs #{ENV["DOCKER_APP_NAME"]}")
  ci.sh('curl --retry 10 --retry-delay 5 -v localhost:5000/version')
end 

def deploy(ci)
  is_staging = ENV["TRAVIS_TAG"].end_with?("-staging")
  api_version = File.open('Versionfile') {|f| f.readline}
  env = is_staging ? "staging" : "production"
  docker_login_command = "curl -o- https://raw.githubusercontent.com/levibostian/ci-bootstrap/master/aws/ecr-login.sh | AWS_ACCESS_KEY_ID=#{ENV["AWS_ACCESS_KEY_ID"]} AWS_SECRET_ACCESS_KEY=#{ENV["AWS_SECRET_ACCESS_KEY"]} bash"
  application_directory_to_save_to_on_server = "~/#{ENV["TRAVIS_REPO_SLUG"].split("/").join("_")}"

  deploy_user = is_staging ? ENV["STAGING_DEPLOY_USER"] : ENV["PROD_DEPLOY_USER"]
  deploy_host = is_staging ? ENV["STAGING_DEPLOY_HOST"] : ENV["PROD_DEPLOY_HOST"] 
  ci.config_ssh(deploy_user, deploy_host, {:port => ENV["DEPLOY_SSH_PORT"]})

  ci.sh("bundle exec cici decrypt #{env} --debug")

  build_docker_image(ci)
  ci.sh(docker_login_command)
  ci.sh("docker push #{ENV['DOCKER_APP_IMAGE_NAME']}:latest")
  
  ci.sh("docker tag #{ENV['DOCKER_APP_IMAGE_NAME']}:latest #{ENV['DOCKER_APP_IMAGE_NAME']}:#{api_version}")
  ci.sh("docker push #{ENV['DOCKER_APP_IMAGE_NAME']}:#{api_version}")

  ci.ssh("cd; mkdir -p #{application_directory_to_save_to_on_server};")
  ci.ssh("scp -P #{ENV["DEPLOY_SSH_PORT"]} -r /docker/ #{deploy_user}@#{deploy_host}:#{application_directory_to_save_to_on_server}/docker")
  ci.ssh(docker_login_command)
  ci.ssh("docker pull #{ENV['DOCKER_APP_IMAGE_NAME']}:latest")
  ci.ssh("docker stop #{ENV['DOCKER_APP_NAME']}", :fail_non_success => false)
  ci.ssh("docker rm -f #{ENV['DOCKER_APP_NAME']}", :fail_non_success => false)

  ci.sh("npm run db:migrate")

  ci.ssh("cd; cd #{application_directory_to_save_to_on_server}/docker; DOCKER_APP_IMAGE_NAME=#{ENV["DOCKER_APP_IMAGE_NAME"]}:latest /opt/bin/docker-compose -f docker-compose.yml up -d")

  ci.sh("curl -o- https://raw.githubusercontent.com/levibostian/ci-bootstrap/master/honeybadger/deploy.sh | ENVIRONMENT=#{env} REPOSITORY=github.com/#{ENV['TRAVIS_REPO_SLUG']}.git GIT_COMMIT=#{ENV["TRAVIS_COMMIT"]} bash")
end 

if (ARGV[0] == "test") 
  test_docker_image(ci)
elsif (ARGV[0] == "deploy")
  deploy(ci)
else 
  abort("Require arg of test or deploy")
end 

