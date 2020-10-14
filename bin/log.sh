#!/bin/bash 

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
WHITE='\033[0m'

function logSuccess() {
    printf "${GREEN}$1\n"
    printf "\n[SUCCESS] $1\n" >> $OUTPUT
}

function logError() {
    printf "${RED}$1\n"
    printf "\n[ERROR] $1\n" >> $OUTPUT
}

function logVerbose() {
    printf "${YELLOW}$1\n"
    printf "\n[VERBOSE] $1\n" >> $OUTPUT
}

function log() {
    printf "${WHITE}$1\n"
    printf "\n$1\n" >> $OUTPUT
}