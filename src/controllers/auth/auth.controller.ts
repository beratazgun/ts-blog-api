import crypto from 'crypto'
import lodash from 'lodash'
import { faker } from '@faker-js/faker'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import User from '../../models/user.model'
import { IUser } from '../../models/user.model'
import { SendCookie } from '../../utils/SendCookie'
import { ISigninData } from './auth.interface'
import HandleError from '../../utils/HandleError'
import CatchBlock from '../../utils/CatchBlock'
import { EmailService } from '../../utils/EmailService'

export const signup = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { firstName, lastName, email, phone, password, passwordConfirm, role } = req.body

	const user: IUser = await User.create({
		firstName,
		lastName,
		email,
		phone,
		password,
		passwordConfirm,
		role,
		avatar: faker.image.avatar(),
		confirmToken: crypto
			.createHash('sha256')
			.update(crypto.randomBytes(32).toString('hex'))
			.digest('hex'),
		confirmTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
		userSlug: `${lodash.lowerFirst(firstName)}-${lodash.lowerFirst(lastName)}`,
	})

	const sendCookie = new SendCookie(user.id, res)
	sendCookie.send()

	const emailOptions = {
		user,
		token: user.confirmToken,
		subject: 'Account Verification | BLOG',
		templateName: 'emailConfirm',
		route: 'verify/confirm-account',
	}

	const emailService = new EmailService()
	await emailService.sendEmail(emailOptions)

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		message:
			'Your account has been created successfully. Please check your email to confirm your account.',
	})
})

export const signin = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { email, password }: ISigninData = req.body

	if (!email || !password) {
		return new HandleError('Please provide email and password.', 400, false)
	}

	const user = await User.findOne({ email }).select('+password')

	if (!user || !(await user.isCorrectPassword(password, user.password))) {
		return next(new HandleError('Incorrect email or password.', 401, false))
	}

	if (user.isAccountActive === false) {
		return next(new HandleError('Your account is not active.', 401, false))
	}

	const sendCookie = new SendCookie(user.id, res)
	sendCookie.send()

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		message: 'You are logged in successfully.',
	})
})

export const logout = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	res.clearCookie('jwt')

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		message: 'You are logged out successfully.',
	})
})

export const protectRoute = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	if (!req.cookies.jwt) {
		return next(new HandleError('You are not logged in. Please log in to get access.', 401, false))
	}

	const token: string = req.cookies.jwt

	const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY as string) as { id: string }

	if (!decoded) {
		return next(new HandleError('Your token is invalid.', 401, false))
	}

	const currentUser = await User.findById(decoded.id)

	if (!currentUser) {
		return next(new HandleError("The user doesn't exist.", 401, false))
	}

	res.locals.user = currentUser
	next()
})

export const getMe = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		message: 'You are logged in successfully.',
		data: res.locals.user,
	})
})

export const isAuthor = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	if (res.locals.user.role !== 'author') {
		return next(new HandleError('You are not authorized to perform this action.', 401, false))
	}
	next()
})

export const confirmAccount = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		if (!res.locals.user.confirmToken)
			next(new HandleError('Oops. Something went wrong.', 401, false))

		if (
			res.locals.user.confirmToken === req.query.token &&
			res.locals.user.confirmTokenExpires > Date.now()
		) {
			await User.findByIdAndUpdate(res.locals.user.id, {
				isAccountActive: true,
				$unset: { confirmToken: 1, confirmTokenExpires: 1 },
			})

			res.status(200).json({
				statusCode: 200,
				isSuccess: true,
				message: 'Your account has been activated successfully.',
			})
		}

		next(new HandleError('Your token has expired.', 401, false))
	}
)

export const sendForgotPasswordEmail = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email }: { email: string } = req.body

		const user = await User.findOne({ email })

		if (!user) {
			return next(new HandleError('There is no user with email address.', 404, false))
		}

		const resetToken = user.createPasswordResetToken()
		await user.save({ validateBeforeSave: false })

		const emailOptions = {
			token: resetToken,
			user,
			subject: 'Forgot Password - Password Reset Request',
			templateName: 'passwordResetEmail',
			route: 'ap/reset-password',
		}

		const emailService = new EmailService()
		await emailService.sendEmail(emailOptions)

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			message: 'Password reset mail has been sent to your email address.',
		})
	}
)

export const resetPassword = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { password, passwordConfirm }: { password: string; passwordConfirm: string } = req.body

	const hashedToken = crypto
		.createHash('sha256')
		.update(req.query.token as string)
		.digest('hex')

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	})

	if (!user) {
		return next(new HandleError('Token is invalid or has expired.', 400, false))
	}

	user.password = password
	user.passwordConfirm = passwordConfirm
	user.passwordResetToken = undefined
	user.passwordResetExpires = undefined
	await user.save()

	const emailOptions = {
		user,
		subject: 'Password Reset Successfully',
		templateName: 'passwordResetSuccess',
	}

	const emailService = new EmailService()
	await emailService.sendEmail(emailOptions)

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		message: 'Your password has been reset successfully.',
	})
})
