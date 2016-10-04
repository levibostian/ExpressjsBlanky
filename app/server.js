/* @flow */

var express = require('express');
var cluster = require('cluster');
var bodyParser = require('body-parser');
var passport = require('passport');
var config = require('./config');
var util = require('./util');
var expressValidator = require('express-validator');
var trimBody = require('connect-trim-body');
var winston = require('winston');
var helmet = require('helmet');
var SystemError = require('./responses').SystemError;
var models = require('./model');

if (process.env.NODE_ENV === "production") {
    winston.add(winston.transports.File, {
        filename: 'blanky_application_log.log'
    });
}

if (cluster.isMaster && process.env.NODE_ENV === "production") {
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

    app.enable('trust proxy');
    app.use(express.static(__dirname + '/public')); // starting static fileserver
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(expressValidator());
    app.use(trimBody());
    app.use(passport.initialize());
    app.use(helmet());

    app.use(require('./controller'));

    app.use(function errorHandling(err, req, res, next) {
        winston.log('error', 'SYSTEM ERROR: ' + err.stack);

        if (res.headersSent) {
            return next(err);
        }

        var message = (process.env.NODE_ENV === "development") ? err : 'System error. Please try again.';
        res.status(500).send(new SystemError(message));
    });

    if (config.isAppStagingInstance()) {
        app.set('port', 5050);
    } else {
        app.set('port', 5000);
    }

    models.sequelize.sync().then(function() {
        var server = app.listen(app.get('port'), function() {
            var host = server.address().address;
            var port = server.address().port;

            winston.log('info', 'Server started. Listening at: %s:%s', host, port);
        });

        module.exports = server;
    });
}
