#!/bin/bash

. bin/log.sh

function require_skaffold() {
    if ! [ -x "$(command -v skaffold)" ]; then
        logError "You need to install the program 'skaffold' on your machine to continue."
        logError "\`brew install skaffold\` if on macOS. Else, see install docs: https://skaffold.dev/docs/install/"
        exit 1
    fi
}

function require_minikube() {
    if ! [ -x "$(command -v minikube)" ]; then
        logError "You need to install the program 'minikube' on your machine to continue."
        logError "\`brew install minikube\` if on macOS. Else, see install docs: https://kubernetes.io/docs/tasks/tools/install-minikube/"
        exit 1
    fi

    if [[ $(minikube status --format='{{.Host}} {{.Kubelet}} {{.APIServer}} {{.Kubeconfig}}') != "Running Running Running Configured" ]]; then 
        logError "minikube doesn't seem to be started. Run the command \`minikube start\` and try again."
        exit 1
    fi 
}

function require_kubectl() {
    if ! [ -x "$(command -v kubectl)" ]; then
        logError "You need to install the program 'kubectl' on your machine to continue."
        logError "\`brew install kubectl\` if on macOS. Else, see install docs: https://kubernetes.io/docs/tasks/tools/install-kubectl/"
        exit 1
    fi
}

function require_docker() {
    if ! [ -x "$(command -v docker)" ]; then
        logError "You need to install the program 'docker' on your machine to continue."
        logError "See install docs: https://hub.docker.com/editions/community/docker-ce-desktop-mac/"
        exit 1
    fi
}

# For pods in minikube to connect to host machine https://github.com/kubernetes/minikube/issues/8439#issuecomment-662244769 
# Using just `host.minikube.internal` does not work according to that issue. 
# Instead of using a hostAlias in the k8s manifest, we are instead checking that the .env value is set correctly. 
# Pros: 
#   * Better error handling and help. Easier for new devs to understand and existing team members to remember what's going on. 
#   * You only need to set this value once. Will work until your minikube cluster is *deleted*, not just stopped. 
# Cons:
#   * Not automated. 
#   * Using scripting instead of being built-into k8s. 
# 
# I have tried kustomize to do this as well but kustomize doesn't work with environment variable substitution and many github issues 
# in the project say, "Create a script to do that..." indicating this is how they intend you do it anyway. 
#
# I have tried to use sed to dynamically edit my files with the correct IP address, too. Problem is that this regex I have written
# requires documentation in it. And editing a file on the fly can cause issues. 
function require_database_dotenv() {
    # This is how to get the IP address of the host machine from the minikube cluster. 
    HOST_IP=$(minikube ssh grep host.minikube.internal /etc/hosts | cut -f1)
    
    if ! cat .env | grep -w "DATABASE_HOST=$HOST_IP" > /dev/null; then 
        logError "Set DATABASE_HOST in .env to $HOST_IP and try again"
        exit 1
    fi

    if ! cat .env | grep -w "REDIS_HOST=$HOST_IP" > /dev/null; then 
        logError "Set REDIS_HOST in .env to $HOST_IP and try again"
        exit 1
    fi
}