FROM node:lts-alpine AS builder

WORKDIR /build
COPY package*.json .babelrc /build/
COPY app /build/app/
RUN npm install &&\
    npx babel app --out-dir dist --copy-files --extensions '.ts,.tsx'

FROM node:lts-alpine 

EXPOSE 5000

ENV HOME=/home/app/
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

COPY --from=builder /build/dist ${HOME}/dist
COPY .env .sequelizerc package*.json Versionfile ${HOME}/

RUN npm install --production &&\
    chown -R node:node .

USER node

CMD ["ls"]
