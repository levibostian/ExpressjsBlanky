/* @flow */

var Promise = require('bluebird')
var mustache = require('mustache')
var fs = require('fs')
var winston = require('winston')

const API_KEY: ?string = process.env.API_MAILGUN_API_KEY
const DOMAIN: string = "mail.levibostian.com"
const FROM_EMAIL_NAME: string = "Levi Bostian"
const FROM_EMAIL: string = "noreply@mail.levibostian.com"

if (!API_KEY) { throw new Error('Must set all of the email environmental variables before sending emails.') }
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN})

exports.sendAddedToSupportGroupEmail = (to: string, firstName: string = "Yo"): Promise<> => {
    return sendEmail(to, "Wazzzzzzuuuupppppppp", "foo.html", {first_name: firstName})
}

function getHtmlString(templateName, params): Promise<string> {
    return new Promise(function(resolve, reject) {
        fs.readFile(__dirname + '/templates/' + templateName, "utf-8", function(err, html) {
            if (err) { return reject(err) }
            return resolve(mustache.render(html, params))
        })
    })
}
function sendEmail(to: string, subject: string, templateName: string, templateParams: Object): Promise<> {
    return new Promise(function(resolve, reject) {
        getHtmlString(templateName, templateParams).then((body) => {
            var data: Object = {
                from: FROM_EMAIL_NAME + ' <' + FROM_EMAIL + '>',
                to: to,
                subject: subject,
                html: body
            }
            if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
                mailgun.messages().send(data, (error) => { // (error, body)
                    if (error) { return reject(error) }
                    return resolve()
                })
            } else {
                winston.log('info', 'sending email....' + subject)
                winston.log('info', templateParams)
                return resolve()
            }
        }).catch((error) => {
            return reject(error)
        })
    })
}
