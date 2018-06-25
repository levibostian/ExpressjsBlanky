/* @flow */

import './auth'

import type {$Request, $Response} from 'express'
import errorResponseHandler from './error_response_handler'
import validateParams from './validate_params'

export type MiddlewareFunctionType = (req: $Request, res: $Response, next: Function) => void
export type ErrorMiddlewareFunctionType = (error: ?Error, req: $Request, res: $Response, next: Function) => void

export {errorResponseHandler, validateParams}
