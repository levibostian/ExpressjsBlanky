FROM node:12-alpine AS builder

WORKDIR /build
COPY package*.json tsconfig.json /build/
COPY app /build/app/
COPY @types /build/@types/
RUN npm ci
RUN npm run build

FROM node:12-alpine 

EXPOSE 5000

ENV HOME=/home/app/
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ARG ENV=production
ENV NODE_ENV $ENV

COPY --from=builder --chown=node:node /build/dist ${HOME}/dist
COPY --chown=node:node .sequelizerc package*.json Versionfile ${HOME}/

RUN npm install --production &&\
    npm install nodemon 

CMD npm run $NODE_ENV