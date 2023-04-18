import * as nodemailer from 'nodemailer'
import * as pug from 'pug'
import { IUser } from '../models/user.model'
import path from 'path'
import lodash from 'lodash'

interface EmailOptions {
	user: IUser
	subject: string
}

export class Email {
	private transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT as number | undefined,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		})
	}

	public async sendConfirmationEmail(options: EmailOptions) {
		const url = `${process.env.APP_URL}/verify/confirm-account?token=${options.user.confirmToken}`

		const html = pug.renderFile(path.join(__dirname, '../views/email/emailConfirm.pug'), {
			firstName: lodash.upperFirst(options.user.firstName),
			lastName: lodash.upperFirst(options.user.lastName),
			url: url,
		})

		const mailOptions = {
			from: 'Berat Azgun <blog@berat.io>',
			to: options.user.email,
			subject: options.subject,
			html: html,
		}

		await this.transporter.sendMail(mailOptions)
	}
}
