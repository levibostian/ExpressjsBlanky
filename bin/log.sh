#!/bin/bash 

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
WHITE='\033[0m'

function logSuccess() {
    printf "${GREEN}[SUCCESS] $1${WHITE}\n"
}

function logError() {
    printf "${RED}[ERROR] $1${WHITE}\n"
}

function logVerbose() {
    printf "${YELLOW}[VERBOSE] $1${WHITE}\n"
}

function log() {
    printf "${WHITE}$1${WHITE}\n"
}