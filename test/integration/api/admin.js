/* @flow */

import {Promise} from 'bluebird'
var request = require('supertest')
var should = require('should')
var testUtil = require('./util')
var uid2 = require('uid2')
var nock = require('nock')
import {User, Organization, AccessCode, Industry, BioQuestion, AnsweredQuestion, SupportGroup, ChatMessage} from '../../../app/model'
var Auth = require('../../../app/middleware/auth')
import {describe, it, before, beforeEach, afterEach, after} from 'mocha'

require("blanket")

var server
describe('Foo', () => {
    const endpoint: string = '/v1/foo'

    before(() => {
        testUtil.checkDebug()
    })
    beforeEach(() => {
        nock.disableNetConnect()
        nock.enableNetConnect('127.0.0.1')

        process.env.NODE_ENV = "testing"
        server = require('../../../app/').server
    })
    afterEach(() => {
        server.close()
    })
    after(() => {
        //testUtil.deleteTestingDb()
    })
    it('should error auth fail no access token given.', (done) => {
        testUtil.createDb().then(() => {
            request(server).post(endpoint)
            .expect(401, done)
        })
    })
    it('should error bad auth token give.', (done) => {
        testUtil.createDb().then(() => {
            request(server).post(endpoint)
            .set('Authorization', 'Bearer ' + uid2(128))
            .end((err: Object, res: Object) => {
                res.status.should.be.equal(401)
                done()
            })
        })
    })
    it('should error did not give industry_id or private_note.', (done) => {
        testUtil.createDb().then(() => {
            request(server).post(endpoint)
            .set('Authorization', 'Bearer ' + Auth.adminToken)
            .end((err: Object, res: Object) => {
                res.status.should.be.equal(422)
                done()
            })
        })
    })
    it('should error did not give industry_id.', (done) => {
        testUtil.createDb().then(() => {
            request(server).post(endpoint)
            .set('Authorization', 'Bearer ' + Auth.adminToken)
            .send({private_note: uid2(20)})
            .end((err: Object, res: Object) => {
                res.status.should.be.equal(422)
                done()
            })
        })
    })
    it('should successfully create group.', (done) => {
        const privateNote: string = uid2(20)
        testUtil.createDb().then(() => { return Industry.createTest() })
        .then((industry: Industry) => {
            request(server).post(endpoint)
            .set('Authorization', 'Bearer ' + Auth.adminToken)
            .send({industry_id: industry.id, private_note: privateNote})
            .end((err: Object, res: Object) => {
                res.status.should.be.equal(200)
                const createdGroup: Object = res.body.group
                createdGroup.id.should.be.ok()
                createdGroup.private_note.should.be.equal(privateNote)
                createdGroup.industry_id.should.be.equal(industry.id)
                done()
            })
        })
    })
})
