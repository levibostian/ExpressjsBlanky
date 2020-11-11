FROM node:12-alpine as builder

WORKDIR /app

ADD dist /app
COPY package*.json /app/
RUN find . -type f -name '*.map' -delete

RUN npm ci --only=production 
RUN find node_modules -type f -name 'Dockerfile' -delete &&\
    find node_modules -type f -name 'docker-compose.yml' -delete 

# Distroless documentation: https://github.com/GoogleContainerTools/distroless/
# Documentation for nodejs: https://github.com/GoogleContainerTools/distroless/blob/master/nodejs/README.md
# Debugging documentation: https://github.com/GoogleContainerTools/distroless/#debug-images
FROM gcr.io/distroless/nodejs:12

EXPOSE 5000

WORKDIR /app

# Override in skaffold.yaml with environemnt variable
ARG ENV=testing 
ENV NODE_ENV $ENV

COPY --from=builder /app /app

# must use a node script as distroless does not come with something like curl
# Thanks, https://anthonymineo.com/docker-healthcheck-for-your-node-js-app/
HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \  
    CMD node docker_healthcheck.js

# --async-stack-traces to make stacktraces have better support for async/await code. You no longer lose parts of your stacktrace when an error occurs. 
CMD ["--async-stack-traces", "start.js"] 