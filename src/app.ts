import express, { Express } from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser = require('cookie-parser')
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import cors from 'cors'
dotenv.config()

const app: Express = express()

app.use(
	cors({
		credentials: true, // This is important.
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
	})
)

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

export { app }
