#!/bin/bash

# Runs some redis-cli commands and expect an output. If an output is not what's expected, we will exit and fail. 
# Requires 1 argument: the auth password that redis needs to authenticate with redis server 

fail() {
    echo "Expected $1, got $2"
    exit 1
}

test_command() {
    COMMAND="$1"
    expected="$2"    
    actual=`$COMMAND`
    [[ "$actual" =~ "$expected" ]] || fail $expected $actual
}

AUTH=$1

test_command "redis-cli PING" "NOAUTH Authentication required"
test_command "redis-cli -a $AUTH PING" "PONG"
test_command "redis-cli -a $AUTH SET foo 100" "OK"
test_command "redis-cli -a $AUTH GET foo" "100"
test_command "redis-cli -a $AUTH DEL foo" "1"