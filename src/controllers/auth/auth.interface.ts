import { Request } from 'express'
import { IUser } from '../../models/user.model'

export interface ISigninData {
	email: string
	password: string
}

export interface IUpdatePasswordData {
	currentPassword: string
	newPassword: string
	newPasswordConfirm: string
}

export interface IResetPasswordData {
	password: string
	passwordConfirm: string
}

export interface ISignupData {
	firstName: string
	lastName: string
	email: string
	phone: string
	password: string
	passwordConfirm: string
	role: string
}
