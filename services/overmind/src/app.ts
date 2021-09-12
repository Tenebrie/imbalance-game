import 'source-map-support/register'
import 'module-alias/register'

import { colorizeId } from '@src/utils/Utils'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import expressWs from 'express-ws'
import logger from 'morgan'

import { wsLogger } from './utils/WebSocketLogger'

const app = express()
expressWs(app)

/* Random middleware */
if (process.env.NODE_ENV === 'development') {
	app.use(logger('dev'))
}
app.set('view engine', 'html')
app.use(wsLogger())
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

// Routes go here!
app.get('/', (req: Request, res: Response) => {
	res.json({
		hello: 'world',
	})
})

const port = process.env.PORT || 3001
console.info(`Starting listening at port ${colorizeId(port)}`)
app.listen(port)
