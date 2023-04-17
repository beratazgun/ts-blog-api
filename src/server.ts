import { app } from './app'
import mongoose from 'mongoose'

const port: number = Number(process.env.PORT) || 3000

//! Cloud MongoDB
// const mongodbUrl: string = (process.env.MONGODB_CLOUD_URL as string).replace(
// 	'<password>',
// 	process.env.MONGODB_CLOUD_PASSWORD as string
// )

// mongoose
// 	.connect(mongodbUrl, {
// 		autoIndex: true,
// 	})
// 	.then((): void => console.log('Connected to MongoDB! 🚀🚀🚀'))
// 	.catch((err: Error): void => console.log(err))

//! Local MongoDB
mongoose
	.set('autoIndex', true)
	.connect(process.env.MONGODB_LOCAL_URL as string)
	.then((): void => {
		console.log('Connected to MongoDB! 🚀🚀🚀')
	})
	.catch((err: Error): void => {
		console.log(err)
	})

app.listen(port, (): void => console.log('Listening on port 3000! 🎧🎧🎧'))
