import express from 'express'
import {
	getAllCategories,
	createCategory,
	deleteCategory,
} from '../controllers/category.controller'

const router = express.Router()

router.route('/create-category').post(createCategory)
router.route('/get-all-categories').get(getAllCategories)
router.route('/delete-category/:id').delete(deleteCategory)

export default router
