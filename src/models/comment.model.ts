import { Schema, model, Document } from 'mongoose'

export interface IComment extends Document {
	comment: string
	userId: Schema.Types.ObjectId
	postId: Schema.Types.ObjectId
	createdAt: Date
	updateAt: Date
}

const CommentSchema = new Schema({
	comment: {
		type: String,
		required: [true, 'Comment cannot be empty'],
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Comment must belong to a user'],
	},
	postId: {
		type: Schema.Types.ObjectId,
		ref: 'Post',
		required: [true, 'Comment must belong to a post'],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updateAt: {
		type: Date,
		default: Date.now(),
	},
})

const Comment = model<IComment>('Comment', CommentSchema)

export default Comment
