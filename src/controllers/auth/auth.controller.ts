import User from '../../models/user.model'
import crypto from 'crypto'
import { IUser } from '../../models/user.model'
import { Request, Response, NextFunction } from 'express'
import lodash from 'lodash'
import { faker } from '@faker-js/faker'
import { SendCookie } from '../../utils/SendCookie'
import { ISigninData } from './auth.interface'
import HandleError from '../../utils/HandleError'
import jwt from 'jsonwebtoken'
import CatchBlock from '../../utils/CatchBlock'
import { Email } from '../../utils/Email'

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
		confirmToken: crypto.randomBytes(32).toString('hex'),
		confirmTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
		userSlug: `${lodash.lowerFirst(firstName)}-${lodash.lowerFirst(lastName)}`,
	})

	const sendCookie = new SendCookie(user.id, res)
	sendCookie.send()

	const emailOptions = {
		user,
		subject: 'Account Verification | BLOG',
	}

	const sendEmail = new Email()
	await sendEmail.sendConfirmationEmail(emailOptions)

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
		if (!res.locals.user.confirmToken && res.locals.user.isAccountActive === true)
			next(new HandleError('Oops. Something went wrong.', 401, false))

		if (res.locals.user.confirmTokenExpires < Date.now())
			next(new HandleError('Your token has expired.', 401, false))

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
	}
)
