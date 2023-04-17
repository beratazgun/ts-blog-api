import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'

export interface IUser extends Document {
	id: string
	firstName: string
	lastName: string
	phone: string
	email: string
	password: string
	passwordConfirm: string | undefined
	role: string
	createdAt: Date
	updatedAt: Date
	avatar: string
	userSlug: string
	passwordChangedAt: Date
	isAccountActive: boolean
	// confirmToken: string
	isCorrectPassword: (userEnteredPassword: string, userPassword: string) => Promise<boolean>
}

const UserSchema = new Schema<IUser>({
	firstName: {
		type: String,
		required: [true, 'First name is required.'],
		lowercase: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required.'],
		lowercase: true,
		trim: true,
	},
	email: {
		index: true,
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	phone: {
		index: true,
		type: String,
		unique: true,
		required: [true, 'Please provide your phone number'],
		trim: true,
		validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
	},
	password: {
		type: String,
		required: [true, 'Password is required.'],
		trim: true,
		validate: [
			validator.isStrongPassword,
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.',
		],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Password confirmation is required.'],
		trim: true,
		validate: {
			validator: function (el: string): boolean {
				return el === (this as any).password
			},
			message: 'Passwords are not the same',
		},
	},
	role: {
		type: String,
		required: true,
		default: 'user',
		enum: ['user', 'admin', 'author'],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
	avatar: {
		type: String,
	},
	userSlug: {
		type: String,
	},
	passwordChangedAt: Date,
	isAccountActive: {
		type: Boolean,
		default: true,
	},
	// confirmToken: String,
})

UserSchema.methods.isCorrectPassword = async function (
	userEnteredPassword: string,
	userPassword: string
): Promise<boolean> {
	return await bcrypt.compare(userEnteredPassword, userPassword)
}

UserSchema.pre<IUser>('save', async function (next) {
	this.password = await bcrypt.hash(this.password, 12)

	this.passwordConfirm = undefined

	next()
})

const User = model<IUser>('User', UserSchema)

export default User
