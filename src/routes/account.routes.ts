import express from 'express'
import { protectRoute, confirmAccount } from '../controllers/auth/auth.controller'

const router = express.Router()

router.use(protectRoute)

router.route('/verify/confirm-account').post(confirmAccount)

export default router
