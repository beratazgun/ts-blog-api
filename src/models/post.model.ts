import mongoose, { Schema, model, Document } from 'mongoose'

export interface IPost extends Document {
	title: string
	content: string
	description: string
	hrefSlug: string
	images: string[]
	numberOfViews: number
	authorId: Schema.Types.ObjectId
	categoryId: Schema.Types.ObjectId
	createAt: Date
	updateAt: Date
}

const PostSchema = new Schema<IPost>({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please enter a title.'],
	},
	content: {
		type: String,
		trim: true,
		required: [true, 'Please enter a content.'],
	},
	description: {
		type: String,
		trim: true,
		required: [true, 'Please enter a description.'],
	},
	authorId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Please enter a authorId.'],
	},
	categoryId: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: [true, 'Please enter a categoryId.'],
	},
	hrefSlug: {
		type: String,
		trim: true,
	},
	images: [
		{
			type: String,
		},
	],
	numberOfViews: {
		type: Number,
		default: 0,
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

const Post = model<IPost>('Post', PostSchema)

export default Post
