import mongoose, { Schema, model, Document } from 'mongoose'

export interface ICategory extends Document {
	categoryName: string
	categorySlug: string
	createAt: Date
	updateAt: Date
}

const CategorySchema = new Schema<ICategory>({
	categoryName: {
		type: String,
		trim: true,
		required: [true, 'Please enter a category name.'],
		unique: true,
	},
	categorySlug: {
		type: String,
	},
	createAt: {
		type: Date,
		default: Date.now,
	},
	updateAt: {
		type: Date,
		default: Date.now,
	},
})

const Category = model<ICategory>('Category', CategorySchema)

export default Category
