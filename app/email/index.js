/* @flow */

import mustache from 'mustache'
import fs from 'fs'
import winston from 'winston'

const API_KEY: ?string = process.env.API_MAILGUN_API_KEY
const DOMAIN: ?string = process.env.EMAIL_FROM_DOMAIN
const FROM_EMAIL_NAME: ?string = process.env.EMAIL_FROM_NAME
const FROM_EMAIL: ?string = process.env.EMAIL_FROM_EMAIL_ADDRESS

if (!API_KEY || !DOMAIN || !FROM_EMAIL_NAME || !FROM_EMAIL) { throw new Error(`Must set all of the email environmental variables in ${__dirname}/${__filename} before sending emails.`) }
const mailgun: Object = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN})

// Used for testing purposes only. If running tests, these variables are set for the last sent email to inspect.
type EmailTestingDataType = {
  from: string,
  to: string,
  subject: string,
  html: string,
  params: { [templateVariable: string]: string },  
}

const blankTestingData: () => EmailTestingDataType = (): EmailTestingDataType => {
  return {
    from: "",
    to: "",
    subject: "",
    html: "",
    params: {}
  }
}
export var testing: EmailTestingDataType = blankTestingData()
export const resetTestLastEmail: () => void = () => {
  testing = blankTestingData()
}

export const sendEmail: (to: string, subject: string, templateName: string, templateParams: { [templateVariable: string]: string }) => Promise<void> = (to: string, subject: string, templateName: string, templateParams: { [templateVariable: string]: string }): Promise<void> => {
  return getHtmlString(templateName, templateParams).then((body: string): Promise<any> => {
    var data: {
        from: string,
        to: string,
        subject: string,
        html: string
      } = {
        from: FROM_EMAIL_NAME + ' <' + FROM_EMAIL + '>',
        to: to,
        subject: subject,
        html: body
      }
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "beta") {
      return mailgun.messages().send(data, (error: Error, body: string): Promise<void> => {
        if (error) { return Promise.reject(error) }
        return Promise.resolve()
      })
    } else {
      testing = {
        params: templateParams,
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.html
      }
      winston.log('info', `sending email with subject: ${subject}`)
      winston.log('info', `email params: ${JSON.stringify(templateParams)}`)
      return Promise.resolve()
    }
  }).catch((error: Error): Promise<void> => {
    return Promise.reject(error)
  })
}

const getHtmlString: (templateName: string, params: Object) => Promise<string> = (templateName: string, params: Object): Promise<string> => {
  return new Promise((resolve: Function, reject: Function) => {
    fs.readFile(__dirname + '/templates/' + templateName, "utf-8", (err: ?Error, html: string): void => {
      if (err) { return reject(err) }
      return resolve(mustache.render(html, params))
    })
  })
}
