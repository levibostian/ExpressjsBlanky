FROM node:12-alpine 

EXPOSE 5000

ENV HOME=/home/app/
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

# Override in skaffold.yaml with environemnt variable
ARG ENV=testing 
ENV NODE_ENV $ENV

COPY --chown=node:node dist ${HOME}/dist
COPY --chown=node:node package*.json ${HOME}/

RUN npm install --production

CMD node dist/start.js