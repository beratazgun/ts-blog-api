import CatchBlock from '../../utils/CatchBlock'
import { Auth } from './Auth'
import { Request, Response, NextFunction } from 'express'

const auth: Auth = new Auth()

const signup = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	await auth.signup(req, res, next)
})

const signin = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	await auth.signin(req, res, next)
})

const logout = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	await auth.logout(req, res, next)
})

const protectRoute = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	await auth.protectRoute(req, res, next)
})

const getMe = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	await auth.getMe(req, res, next)
})

export { signup, signin, logout, protectRoute, getMe }
