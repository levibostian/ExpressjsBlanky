/* @flow */

var express = require('express')
var cluster = require('cluster')
var bodyParser = require('body-parser')
var passport = require('passport')
var auth = require('./middleware')
var expressValidator = require('express-validator')
var trimBody = require('connect-trim-body')
var winston = require('winston')
var winstonSlacker = require('winston-slacker')
var helmet = require('helmet')
var SystemError = require('./responses').SystemError
var models = require('./model')

if (process.env.NODE_ENV === "production") {
    if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_CHANNEL) {
        var winstonSlackerOptions = {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: process.env.SLACK_CHANNEL,
            username: "Prod status bot"
        }
        winston.add(winstonSlacker, winstonSlackerOptions)
    }
    winston.add(winston.transports.File, {
        filename: 'foo_application.log'
    })
}

if (process.env.NODE_ENV === "staging") {
    if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_CHANNEL) {
        var winstonSlackerOptions = {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: process.env.SLACK_CHANNEL,
            username: "Staging status bot"
        }
        winston.add(winstonSlacker, winstonSlackerOptions)
    }
    winston.add(winston.transports.File, {
        filename: 'foo_staging_application.log'
    })
}

if (cluster.isMaster && (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging")) {
    var numWorkers = require('os').cpus().length;

    winston.log('info', 'Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    // $FlowIssue on() Node function is not recognized by flow
    cluster.on('online', function(worker) {
        winston.log('info', 'Worker ' + worker.process.pid + ' is online');
    });

    // $FlowIssue on() Node function is not recognized by flow
    cluster.on('exit', function(worker, code, signal) {
        winston.log('error', 'Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        winston.log('info', 'Starting a new worker');

        cluster.fork();
    });
} else {
    var app = express();

    const virtualHost = process.env.VIRTUAL_HOST
    if (!virtualHost && process.env.NODE_ENV != "development" && process.env.NODE_ENV != "testing") { throw new Error("You did not set VIRTUAL_HOST environment variable yet. Set it as a comma separated list of domains/subdomains for your application.") }

    app.enable('trust proxy');
    app.use('/', express.static(__dirname + '/static_root'))
    app.use('/static', express.static(__dirname + '/static'))
    if (virtualHost) { app.use('/.well-known/', express.static('/ssl/webroot/' + virtualHost + '/.well-known')) }
    app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(expressValidator({
        customValidators: {
            isArray: (value): boolean => {
                return Array.isArray(value)
            },
            isPosPostgresInt: (value: any): boolean => {
                return !isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= 2147483647
            },
            isPostgresInt: (value: any): boolean => {
                return !isNaN(value) && parseInt(value) >= -2147483648 && parseInt(value) <= 2147483647
            },
            isLengthStrippingChars: (value: any, length: number): boolean => {
                const valueLength = value.replace(/-/g, '').replace(/\ /g, '').length
                return valueLength === length
            }
        }
    }));
    app.use(trimBody());
    app.use(passport.initialize());
    app.use(helmet());

    app.use(require('./controller'));

    process.on('uncaughtException', (err) => {
        winston.log('error', 'SYSTEM ERROR (caught in uncaughtException handler). Message: ' + err.message + ' stack: ' + err.stack)
    })

    app.use((req, res, next): void => {
        //res.header('Access-Control-Allow-Origin', 'levibostian.com')
        res.header('Access-Control-Allow-Origin', '*') // for now do this because I need the admin endpoints to be open for me.
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        next()
    })

    app.use(function errorHandling(err, req, res, next) {
        winston.log('error', 'SYSTEM ERROR. Message: ' + err.message + ' stack: ' + err.stack)

        if (res.headersSent) {
            return next(err);
        }

        var message = (process.env.NODE_ENV != "production") ? err : 'System error. Please try again.';
        res.status(500).send(new SystemError(message));
    });

    app.set('port', 5000)

    if (process.env.NODE_ENV != "testing") {
        models.sequelize.sync().then(function() {
            var server = app.listen(app.get('port'), function() {
                var host = server.address().address;
                var port = server.address().port;

                winston.log('info', 'Server started. Listening at: %s:%s', host, port)
            })

            module.exports = server;
        })
    } else {
        var server = app.listen(app.get('port'), () => {
            var host = server.address().address
            var port = server.address().port

            winston.log('info', 'Server started. Listening at: %s:%s', host, port)
        })

        module.exports = server
    }
}
