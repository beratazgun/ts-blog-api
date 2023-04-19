import express, { Express } from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser = require('cookie-parser')
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import cors from 'cors'
dotenv.config()

import HandleError from './utils/HandleError'
import accountRoutes from './routes/account.routes'
import authRoutes from './routes/auth.routes'
import postRoutes from './routes/post.routes'
import categoryRoutes from './routes/category.routes'
import commentRoutes from './routes/comment.routes'
import errorController from './controllers/error.controller'

const app: Express = express()

app.use(
	cors({
		credentials: true, // This is important.
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
	})
)

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(mongoSanitize())

app.use(morgan('dev'))

app.use(helmet())

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 120, // Limit each IP to 120 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/post', postRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/comment', commentRoutes)
app.use('/', accountRoutes)

app.all('*', (req, res, next) => {
	next(new HandleError('This route does not exist', 404, false))
})

app.use(errorController)

export { app }
