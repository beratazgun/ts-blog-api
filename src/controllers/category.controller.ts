import Category from '../models/category.model'
import { Request, Response, NextFunction } from 'express'
import HandleError from '../utils/HandleError'
import Post from '../models/post.model'
import CatchBlock from '../utils/CatchBlock'

export const getAllCategories = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const categories = await Category.find()

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			message: 'Get all categories successfully.',
			data: categories,
		})
	}
)

export const createCategory = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { categoryName } = req.body

		const category = await Category.create({
			categoryName,
			categorySlug: categoryName.toLowerCase().replace(/ /g, '-'),
		})

		res.status(201).json({
			statusCode: 201,
			isSuccess: true,
			message: 'Create category successfully.',
			data: category,
		})
	}
)

export const deleteCategory = CatchBlock(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params

		const category = await Category.findByIdAndDelete(id)

		if (!category) {
			return next(new HandleError('Category not found.', 404, false))
		}

		// delete all posts that belong to the category
		await Post.deleteMany({ categoryId: id })

		res.status(200).json({
			statusCode: 200,
			isSuccess: true,
			message: 'Delete category successfully.',
		})
	}
)
