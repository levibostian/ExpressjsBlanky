#!/bin/bash

# Latest version found: https://gist.github.com/levibostian/815b1bd4d62d9b9bc2c0c21d4e84ad08

# Script that executes a command until it succeeds or timesout. 
# Usage: `./bin/loop.sh command-here`
#   You can override the default parts of the script by: 
#   `SLEEP_TIME=1 MAX_TRIES=2 ./bin/loop.sh command-here`
# 
# The script will send STDOUT message giving you an update on how things are going. The exit code of the command will be successful or failed depending on if the command succeeded before the timeout. 
# Thanks, https://stackoverflow.com/a/12321815/1486374

MAX_TRIES=${MAX_TRIES:-5}
SLEEP_TIME=${SLEEP_TIME:-5}
COMMAND="${@:1}" # all args will be processed as a command to evaluate 

echo "Command to run: $COMMAND"

NEXT_WAIT_TIME=0
until [ $NEXT_WAIT_TIME -eq $MAX_TRIES ] || eval "$COMMAND"; do
    ((NEXT_WAIT_TIME++))
    echo "fail (attempt $NEXT_WAIT_TIME/$MAX_TRIES). sleeping $SLEEP_TIME"
    sleep $SLEEP_TIME
done

# To make exit code true/false if the command executed correctly. 
[ $NEXT_WAIT_TIME -lt $MAX_TRIES ]