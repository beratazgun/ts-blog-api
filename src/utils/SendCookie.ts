import jwt, { Secret } from 'jsonwebtoken'
import { Response } from 'express'
export class SendCookie {
	public privateKey: Secret = process.env.JWT_PRIVATE_KEY as string
	public expiresIn: number = Number(process.env.JWT_COOKIE_EXPIRES_IN)

	constructor(public id: string, public res: Response) {}

	generateToken(ıd: string): string {
		return jwt.sign({ id: ıd }, this.privateKey, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		})
	}

	send(): void {
		const token: string = this.generateToken(this.id)
		this.res.cookie('jwt', token, {
			expires: new Date(Date.now() + this.expiresIn * 24 * 60 * 60 * 1000),
			httpOnly: true,
		})
	}
}
