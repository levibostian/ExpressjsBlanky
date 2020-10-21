FROM node:12-alpine AS builder

WORKDIR /build
COPY package*.json tsconfig.json /build/
COPY app /build/app/
COPY @types /build/@types/
RUN npx install-subset install build
RUN npm run build

FROM node:12-alpine 

EXPOSE 5000

ENV HOME=/home/app/
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ARG ENV=production
ENV NODE_ENV $ENV

COPY --from=builder --chown=node:node /build/dist ${HOME}/dist
COPY --chown=node:node package*.json ${HOME}/

RUN npm install --production

CMD node dist/start.js