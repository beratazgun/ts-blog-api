import jwt, { Secret } from 'jsonwebtoken'
import { response, Response } from 'express'

interface IModel {
	_id: object
}

export class SendCookie {
	public modelId: string = this.model._id.toString()
	public privateKey: Secret = process.env.JWT_PRIVATE_KEY as string
	public expiresIn: number = Number(process.env.JWT_COOKIE_EXPIRES_IN)

	constructor(public model: IModel) {}

	generateToken(ıd: string): string {
		return jwt.sign({ id: ıd }, this.privateKey, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		})
	}

	sendCookie(res: Response): void {
		const token: string = this.generateToken(this.modelId)
		res.cookie('jwt', token, {
			expires: new Date(Date.now() + this.expiresIn * 24 * 60 * 60 * 1000),
			httpOnly: true,
		})
	}
}
