/* @flow */

import type {Server} from "http"
import type {Router, $Response, $Request, $Application, NextFunction, Middleware} from 'express'
const express: Function = require('express')
const cluster: Object = require('cluster')
const bodyParser: Object = require('body-parser')
const passport: Object = require('passport')
const expressValidator: Object = require('express-validator')
const trimBody: Function = require('connect-trim-body')
const winston: Object = require('winston')
const winstonSlacker: Object = require('winston-slacker')
const helmet: Function = require('helmet')
const SystemError: SystemError = require('./responses').SystemError
import {sequelize} from './model'
import {jobs} from './jobs'
import type {Job} from './jobs/type'
import {errorResponseHandler as errorResponseHandlerMiddleware} from './middleware'
import controllers from './controller'
import {redisHost} from './jobs'
import './email'
import './jobs'

export const app: $Application = express()
var server: Server

var winstonSlackerOptions: {
  webhook: string,
  channel: string,
  username: string
} = {
  webhook: process.env.SLACK_WEBHOOK_URL || "",
  channel: process.env.SLACK_CHANNEL || "",
  username: ""
}
if (process.env.NODE_ENV === "production") {
  if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_CHANNEL) {
    winstonSlackerOptions["username"] = "Prod status bot"
    winston.add(winstonSlacker, winstonSlackerOptions)
  }
  winston.add(winston.transports.File, {
    filename: 'prod_app.log'
  })
} else if (process.env.NODE_ENV === "beta") {
  if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_CHANNEL) {
    winstonSlackerOptions["username"] = "Beta status bot"
    winston.add(winstonSlacker, winstonSlackerOptions)
  }
  winston.add(winston.transports.File, {
    filename: 'beta_app.log'
  })
} else {
  winston.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

const Arena: Function = require('bull-arena')
// export const redisHost: string = "app-redis"
const redisHostId: string = "DockerRedis" // Not sure what this is used for, but I am assuming an identifier for the redis host I am using which is always a redis Docker container.
const bullRedisQueues: {
  queues: Array<{
    name: string,
    port: number,
    host: string,
    hostId: string
  }>
} = {
  queues: []
}
jobs.forEach((job: Job) => {
  bullRedisQueues.queues.push({
    name: job.name,
    port: job.port,
    host: redisHost,
    hostId: redisHostId
  })
})
const arena: Middleware = Arena(bullRedisQueues, {
  port: 4568,
  basePath: '/bull',
  disableListen: true
})

export const startServer: () => Server = (): Server => {
  if (server) { return server }

  if (process.env.NODE_ENV != "testing") {
    sequelize.sync().then(() => {
      server = app.listen(app.get('port'), () => {
        winston.log('info', `Server started. Listening at: ${server.address().address}:${server.address().port}`)
      })
    })
  } else {
    server = app.listen(app.get('port'), () => {
      winston.log('info', `Testing server started. Listening at: ${server.address().address}:${server.address().port}`)
    })
  }

  return server
}

export const closeServer: () => void = () => {
  server.close()
}

if (cluster.isMaster && (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "beta")) {
  const numWorkers: number = require('os').cpus().length

  winston.log('info', 'Master cluster setting up ' + numWorkers + ' workers...')
  for (var i: number = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  // $FlowIssue on() Node function is not recognized by flow
  cluster.on('online', function(worker: Object) {
    winston.log('info', 'Worker ' + worker.process.pid + ' is online')
  })

  // $FlowIssue on() Node function is not recognized by flow
  cluster.on('exit', function(worker: Object, code: number, signal: Object) {
    winston.log('error', 'Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
    winston.log('info', 'Starting a new worker')

    cluster.fork()
  })
} else {
  const virtualHost: ?string = process.env.VIRTUAL_HOST
  if (!virtualHost && process.env.NODE_ENV != "development" && process.env.NODE_ENV != "testing") { throw new Error("You did not set VIRTUAL_HOST environment variable yet. Set it as a comma separated list of domains/subdomains for your application.") }

  app.enable('trust proxy')
  app.use('/', express.static(__dirname + '/static')) // Host files located in the `./static` directory at the root.
  app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}))
  app.use(bodyParser.json({limit: '50mb'}))
  app.use(trimBody())
  app.use(passport.initialize())
  app.use(helmet())

  app.use((req: $Request, res: $Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*') // for now do this because I need the admin endpoints to be open for me.
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, accept-version')
    next()
  })

  app.use('/bull', passport.authenticate('admin_basic_auth', {session: false}), (req: $Request, res: $Response, next: NextFunction) => {
    res.locals.basepath = '/bull'
    next()
  })
  app.use('/', arena)
  app.use(controllers)
  app.use(errorResponseHandlerMiddleware)

  process.on('uncaughtException', (err: Error) => {
    winston.log('error', 'SYSTEM ERROR (caught in uncaughtException handler). Message: ' + err.message + ' stack: ' + err.stack)
  })

  app.use((err: Error, req: $Request, res: $Response, next: NextFunction) => {
    if (err) {
      const errorMessage: string = err.message
      winston.log('error', 'SYSTEM ERROR. Message: ' + errorMessage + ' stack: ' + err.stack)

      if (res.headersSent) {
        next(err)
      } else {
        const message: string = (process.env.NODE_ENV != "production") ? errorMessage : 'System error. Please try again.'
        res.status(SystemError.code).send(new SystemError(message).response)
      }      
    }
  })

  app.set('port', 5000)

  startServer()
}
