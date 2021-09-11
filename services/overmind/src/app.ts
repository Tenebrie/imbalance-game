import 'source-map-support/register'
import 'module-alias/register'

import { colorizeId } from '@src/utils/Utils'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import expressWs from 'express-ws'
import logger from 'morgan'

import Database from './database/Database'
import AsyncHandler from './utils/AsyncHandler'
import { wsLogger } from './utils/WebSocketLogger'

const app = express()
expressWs(app)

/* Random middleware */
if (process.env.NODE_ENV === 'development') {
	app.use(logger('dev'))
}
app.use(wsLogger())
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

/* Wait until database client is ready */
app.use(
	AsyncHandler(async (req: any, res: any, next: () => void) => {
		if (!Database.isReady()) {
			throw { status: 503, error: 'Database client is not yet ready' }
		}
		next()
	})
)

// Routes go here!

/* Last-resort error handler */
app.use((err: any, req: Request, res: Response, _next: () => void) => {
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: req.app.get('env') === 'development' ? err : {},
	})
})

const port = process.env.PORT || 3001
console.info(`Starting listening at port ${colorizeId(port)}`)
app.listen(port)
