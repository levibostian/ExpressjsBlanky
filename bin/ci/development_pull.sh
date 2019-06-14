#!/bin/bash

set -e

npm run est:build:ci
npm run test:run:ci
