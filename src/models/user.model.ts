import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import crypto from 'crypto'

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
	isAccountActive: boolean
	confirmToken: string | undefined
	confirmTokenExpires: Date | undefined
	passwordResetToken: string | undefined
	passwordResetExpires: Date | undefined
	passwordChangedAt: Date
	isCorrectPassword: (userEnteredPassword: string, userPassword: string) => Promise<boolean>
	createPasswordResetToken: () => string
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
	isAccountActive: {
		type: Boolean,
		default: false,
	},
	confirmToken: String,
	confirmTokenExpires: Date,
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
})

UserSchema.methods.isCorrectPassword = async function (
	userEnteredPassword: string,
	userPassword: string
): Promise<boolean> {
	return await bcrypt.compare(userEnteredPassword, userPassword)
}

UserSchema.pre<IUser>('save', async function (next) {
	if (!this.isModified('password')) return next()

	this.password = await bcrypt.hash(this.password, 12)

	// this is to remove the passwordConfirm field from the database
	this.passwordConfirm = undefined

	next()
})

UserSchema.methods.createPasswordResetToken = function (): string {
	const token = crypto.randomBytes(32).toString('hex')
	this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
	this.passwordResetExpires = Date.now() + 15 * 60 * 1000
	return token
}

const User = model<IUser>('User', UserSchema)

export default User
