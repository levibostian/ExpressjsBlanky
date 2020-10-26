FROM node:12-alpine as builder

WORKDIR /app

ADD dist /app
COPY package*.json /app/
RUN find . -type f -name '*.map' -delete

RUN npm ci --only=production

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

CMD ["start.js"] 