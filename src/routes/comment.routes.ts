import express from 'express'

import {
	createComment,
	deleteComment,
	getMyComments,
	getCommentsOfPost,
} from '../controllers/comment.controller'
import { protectRoute } from '../controllers/auth/auth.controller'

const router = express.Router()

router.route('/get-comments-of-post/:postId').get(getCommentsOfPost)

router.use(protectRoute)

router.route('/create-comment/:postId').post(createComment)
router.route('/delete-comment/:commentId').delete(deleteComment)
router.route('/get-my-comments').get(getMyComments)

export default router
