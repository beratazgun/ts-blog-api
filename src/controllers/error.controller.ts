import { Response, Request, NextFunction, response } from 'express'
import mongoose, { MongooseError } from 'mongoose'
import lodash from 'lodash'

interface Imessage {
	status: string
	isSuccess: boolean
	statusCode: number
	message: string | { [key: string]: string }
}

class ErrorController {
	constructor(public err: any, public res: Response) {}

	public handleValidationError() {
		const errObj: { [key: string]: string } = {}
		if (this.err instanceof mongoose.Error.ValidationError) {
			Object.values(this.err.errors).forEach((err) => {
				errObj[err.path] = err.message
			})

			const message: Imessage = {
				status: 'error',
				isSuccess: false,
				statusCode: 400,
				message: errObj,
			}
			this.sendError(message)
		}
	}

	public handleCastError() {
		if (this.err instanceof mongoose.Error.CastError) {
			const message: Imessage = {
				status: 'error',
				isSuccess: false,
				statusCode: 400,
				message: `Invalid ${this.err.path}: ${this.err.value}`,
			}
			this.sendError(message)
		}
	}

	public handleDuplicateFieldsDB() {
		const field: string = lodash.lowerCase(lodash.keys(this.err.keyValue)[0])
		const message: Imessage = {
			status: 'error',
			isSuccess: false,
			statusCode: 400,
			message: `This ${field} is already taken.`,
		}
		this.sendError(message)
	}

	public handleJWTError() {
		const message: Imessage = {
			status: 'error',
			isSuccess: false,
			statusCode: 401,
			message: 'Invalid token. Please log in again!',
		}
		this.sendError(message)
	}

	private sendError(message: Imessage): void {
		this.res.status(message.statusCode || 500).json({
			message: message.message,
			status: message.status || 'error',
			isSuccess: message.isSuccess,
			statusCode: message.statusCode,
		})
	}
}

export default (err: any, req: Request, res: Response, next: NextFunction) => {
	const errorController = new ErrorController(err, res)

	if (err.name === 'ValidationError') errorController.handleValidationError()
	if (err.name === 'CastError') errorController.handleCastError()
	if (err.name === 'MongoServerError') errorController.handleDuplicateFieldsDB()
	if (err.name === 'JsonWebTokenError') errorController.handleJWTError()
	else {
		res.status(err.statusCode || 500).json({
			status: err.status || 'error',
			isSuccess: err.isSuccess,
			statusCode: err.statusCode,
			message: err.message,
		})
	}

	next()
}
