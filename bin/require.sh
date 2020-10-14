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