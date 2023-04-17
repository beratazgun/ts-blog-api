import CatchBlock from '../utils/CatchBlock'
import { Request, Response, NextFunction } from 'express'
import Post from '../models/post.model'
import Category from '../models/category.model'
import HandleError from '../utils/HandleError'
import Comment from '../models/comment.model'
import User from '../models/user.model'

export const createPost = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { title, content, description, category, images } = req.body

	// if the category is not exist
	const categoryId = await Category.findOne({ categoryName: category })

	if (!categoryId) {
		return next(new HandleError('Category is not exist.', 400, false))
	}

	const post = await Post.create({
		title,
		content,
		description,
		images,
		hrefSlug: title.toLowerCase().replace(/ /g, '-'),
		authorId: res.locals.user._id,
		categoryId: categoryId._id,
	})

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		data: post,
	})
})

export const deletePost = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params
	const post = await Post.findByIdAndDelete(id)

	if (!post) {
		return next(new HandleError('Post not found', 404, false))
	}

	// if the post is not belong to the user
	if (post.authorId.toString() !== res.locals.user._id.toString()) {
		return next(new HandleError('You are not authorized', 401, false))
	}

	// this will delete all comments that belong to the post
	await Comment.deleteMany({ postId: id })

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
	})
})

export const getAllPosts = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const posts = await Post.find()

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		length: posts.length,
		data: posts,
	})
})

export const getCommentsOfPost = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const comments = await Comment.find({ postId: req.params.id })
		const post = await Post.findById(req.params.id)

		if (!post) {
			return next(new HandleError('Post not found', 404, false))
		}

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			length: comments.length,
			data: comments,
		})
	}
)

export const getPostByPostSlug = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { slug } = req.params

		const data = await Post.find({ hrefSlug: slug })

		if (!data) {
			return next(new HandleError('Post not found', 404, false))
		}

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			data,
		})
	}
)

export const getMyPosts = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const posts = await Post.find({ authorId: res.locals.user.id })

	res.status(200).json({
		statusCode: 200,
		isSuccess: true,
		length: posts.length,
		data: posts,
	})
})

export const getPostByUserSlug = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { slug } = req.params

		const findUser = await User.find({ userSlug: slug })

		if (!findUser) {
			return next(new HandleError('User not found', 404, false))
		}

		const posts = await Post.find({ authorId: findUser[0]._id })

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			length: posts.length,
			data: posts,
		})
	}
)

export const getPostByCategorySlug = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { slug } = req.params

		const categoryId = await Category.find({ categorySlug: slug })

		if (!categoryId) {
			return next(new HandleError('Category not found', 404, false))
		}

		const posts = await Post.find({ categoryId: categoryId[0]._id })

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			length: posts.length,
			data: posts,
		})
	}
)
