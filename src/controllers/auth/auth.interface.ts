import { Request } from 'express'
import { IUser } from '../../models/user.model'

export interface ISigninData {
	email: string
	password: string
}
