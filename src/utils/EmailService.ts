import * as nodemailer from 'nodemailer'
import * as pug from 'pug'
import { IUser } from '../models/user.model'
import path from 'path'
import lodash from 'lodash'

interface EmailOptions {
	user: IUser
	subject: string
	templateName: string
	token?: string | undefined
	route?: string
}

export class EmailService {
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

	public async sendEmail(options: EmailOptions) {
		const url = `${process.env.APP_URL}/${options.route}/?token=${options.token}`

		const html = pug.renderFile(
			path.join(__dirname, `../views/email/${options.templateName}.pug`),
			{
				firstName: lodash.upperFirst(options.user.firstName),
				lastName: lodash.upperFirst(options.user.lastName),
				url: url,
			}
		)

		const mailOptions = {
			from: 'Berat Azgun <blog@berat.io>',
			to: options.user.email,
			subject: options.subject,
			html: html,
		}

		await this.transporter.sendMail(mailOptions)
	}
}
