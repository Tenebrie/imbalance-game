import 'source-map-support/register'
import AsyncHandler from './utils/AsyncHandler'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import 'module-alias/register'
import { cardImageGenerator } from './utils/CardImageGenerator'

import express, { Request, Response } from 'express'
import expressWs from 'express-ws'
import GenericErrorMiddleware from './middleware/GenericErrorMiddleware'
import { wsLogger } from './utils/WebSocketLogger'
import Database from './database/Database'
import { printAllRoutes } from '@src/utils/RoutePrinter'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import CardLibrary from '@src/game/libraries/CardLibrary'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'

const app = express()
expressWs(app)

/* Routers must be imported after express-ws is initialized, therefore 'require' syntax */
const StatusRouter = require('./routers/StatusRouter')
const ChangelogRouter = require('./routers/ChangelogRouter')

const UserRouter = require('./routers/UserRouter')
const PlayRouter = require('./routers/PlayRouter')
const AdminRouter = require('./routers/AdminRouter')
const CardsRouter = require('./routers/CardsRouter')
const RulesetsRouter = require('./routers/RulesetsRouter')
const DecksRouter = require('./routers/DecksRouter')
const DevRouter = require('./routers/DevRouter')
const GamesRouter = require('./routers/GamesRouter')
const ModalsRouter = require('./routers/ModalsRouter')
const SessionRouter = require('./routers/SessionRouter')
const UserProfileRouter = require('./routers/UserProfileRouter')
const WorkshopRouter = require('./routers/WorkshopRouter')

/* Templating engine */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

/* Forced HTTPS */
app.use((req: Request, res: Response, next) => {
	if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development') {
		return res.redirect('https://' + req.get('host') + req.url)
	}
	next()
})

/* Random middleware */
if (process.env.NODE_ENV === 'development') {
	app.use(logger('dev'))
}
app.use(wsLogger())
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

/* Serve static files */
app.use(express.static(path.join(__dirname, '../../../public')))
app.use(express.static(path.join(__dirname, '../../../client/optimized')))
app.use(express.static(path.join(__dirname, '../../../client')))
app.use(express.static(path.join(__dirname, '../../../client/generated')))

/* OPTIONS request */
app.use((req: Request, res: Response, next) => {
	if (req.method === 'OPTIONS') {
		res.status(200)
		res.json(JSON.stringify({}))
	} else {
		next()
	}
})

/* Wait until database client is ready */
app.use(
	AsyncHandler(async (req: any, res: any, next: () => void) => {
		if (!Database.isReady()) {
			throw { status: 503, error: 'Database client is not yet ready' }
		}
		next()
	})
)

/* Page HTTP routers */
app.use('/status', StatusRouter)
app.use('/changelog', ChangelogRouter)

/* API HTTP routers */
app.use('/api/admin', AdminRouter)
app.use('/api/cards', CardsRouter)
app.use('/api/rulesets', RulesetsRouter)
app.use('/api/decks', DecksRouter)
app.use('/api/dev', DevRouter)
app.use('/api/games', GamesRouter)
app.use('/api/session', SessionRouter)
app.use('/api/user', UserRouter)
app.use('/api/user/modals', ModalsRouter)
app.use('/api/user/profile', UserProfileRouter)
app.use('/api/workshop', WorkshopRouter)

/* WS routers */
app.use('/api/game', PlayRouter)

/* Generic error handler */
app.use(GenericErrorMiddleware)

console.info('Registered routes:', printAllRoutes(app))

/* Index fallback */
app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../../client/index.html'))
})

/* Last-resort error handler */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: () => void) => {
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: req.app.get('env') === 'development' ? err : {},
	})
})

/* Generate placeholder images */
cardImageGenerator.generatePlaceholderImages()

CardLibrary.ensureLibraryLoaded()
RulesetLibrary.ensureLibraryLoaded()

/* Clear our old DB data every hour */
setInterval(async () => {
	await GameHistoryDatabase.pruneOldestRecords()
}, 60 * 60 * 1000)

app.listen(process.env.PORT || 3000)
