import express from 'express'
import {
	signup,
	signin,
	logout,
	getMe,
	protectRoute,
	// forgotPassword,
	// confirmAccount,
} from '../controllers/auth/auth.controller'

const router = express.Router()

router.route('/signup').post(signup)
router.route('/signin').post(signin)

router.use(protectRoute)

router.route('/logout').post(logout)
router.route('/get-me').get(getMe)

export default router
