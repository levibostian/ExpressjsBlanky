FROM node:12-alpine 

EXPOSE 5000

ENV HOME=/home/app/
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ENV NODE_ENV=production

COPY --chown=node:node dist ${HOME}/dist
COPY --chown=node:node package*.json ${HOME}/

RUN npm install --production

CMD node dist/start.js