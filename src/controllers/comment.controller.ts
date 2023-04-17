import Comment from '../models/comment.model'
import Post from '../models/post.model'
import CatchBlock from '../utils/CatchBlock'
import HandleError from '../utils/HandleError'
import { Request, Response, NextFunction } from 'express'

export const createComment = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const { comment } = req.body
	const newComment = await Comment.create({
		comment,
		userId: res.locals.user._id,
		postId: req.params.postId,
	})

	const post = await Post.findById(req.params.postId)

	if (!post) {
		return next(new HandleError('Post not found', 404, false))
	}

	res.status(201).json({
		status: 'success',
		isSuccess: true,
		data: newComment,
	})
})

export const deleteComment = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const comment = await Comment.findByIdAndDelete(req.params.commentId)

	if (!comment) {
		return next(new HandleError('Comment not found', 404, false))
	}

	// if the comment is not belong to the user
	if (comment.userId.toString() !== res.locals.user._id.toString()) {
		return next(new HandleError('You are not authorized', 401, false))
	}

	res.status(200).json({
		status: 'success',
		isSuccess: true,
	})
})

export const getMyComments = CatchBlock(async (req: Request, res: Response, next: NextFunction) => {
	const comments = await Comment.find({ userId: res.locals.user._id })

	if (!comments) {
		return next(new HandleError('Comment not found', 404, false))
	}

	res.status(200).json({
		status: 'success',
		isSuccess: true,
		length: comments.length,
		data: comments,
	})
})

export const getCommentsOfPost = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const comments = await Comment.find({ postId: req.params.postId }).populate({
			path: 'userId',
			select: 'firstName lastName avatar',
		})

		if (!comments) {
			return next(new HandleError('Comment not found', 404, false))
		}

		res.status(200).json({
			status: 'success',
			isSuccess: true,
			length: comments.length,
			data: comments,
		})
	}
)
