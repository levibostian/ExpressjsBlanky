/* @flow */

var models = require('../../../../app/model')

var fs = require('fs')
var path = require('path')

exports.checkDebug = () => {
    if (process.env.NODE_ENV === "production") {
        throw new Error('You can only run tests in debug environments.')
    }
}

exports.createDb = (): Promise<> => {
    process.env.NODE_ENV = 'testing'

    return models.sequelize.sync()
}
