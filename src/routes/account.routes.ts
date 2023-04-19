import express from 'express'
import {
	protectRoute,
	confirmAccount,
	sendForgotPasswordEmail,
	resetPassword,
} from '../controllers/auth/auth.controller'

const router = express.Router()
router.route('/forgot-password').post(sendForgotPasswordEmail)
router.route('/ap/reset-password').post(resetPassword)

router.route('/verify/confirm-account').post(protectRoute, confirmAccount)

export default router
