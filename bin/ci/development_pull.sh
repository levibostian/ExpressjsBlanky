#!/bin/bash

set -e

npm run docker:test:build:ci
npm run docker:test:run:ci
