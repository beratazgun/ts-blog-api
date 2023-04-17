import express from 'express'
import { protectRoute, isAuthor } from '../controllers/auth/auth.controller'
import {
	createPost,
	deletePost,
	getMyPosts,
	getCommentsOfPost,
	getAllPosts,
	getPostByPostSlug,
	getPostByUserSlug,
	getPostByCategorySlug,
} from '../controllers/post.controller'

const router = express.Router()

router.route('/get-comments-of-post/:id').get(getCommentsOfPost)
router.route('/get-all-posts').get(getAllPosts)
router.route('/get-post-by-slug/:slug').get(getPostByPostSlug)
router.route('/get-post-by-user-slug/:slug').get(getPostByUserSlug)
router.route('/get-post-by-category-slug/:slug').get(getPostByCategorySlug)

router.use(protectRoute)

router.route('/create-post').post(isAuthor, createPost)
router.route('/delete-post/:id').delete(isAuthor, deletePost)
router.route('/get-my-posts').get(isAuthor, getMyPosts)

export default router
