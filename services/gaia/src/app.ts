import 'source-map-support/register'
import 'module-alias/register'

import path from 'path'

const ROOT_DIR = path.join(__dirname, '../')
const moduleAlias = require('module-alias')
if (__dirname.includes('dist')) {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'src'))
	moduleAlias.addAlias('@shared', path.join(ROOT_DIR, '../../shared/src'))
} else {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'dist/services/gaia/src'))
	moduleAlias.addAlias('@shared', path.join(ROOT_DIR, 'dist/shared/src'))
}

import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import AsciiColor from '@src/enums/AsciiColor'
import DiscordIntegration from '@src/game/integrations/DiscordIntegration'
import CardLibrary from '@src/game/libraries/CardLibrary'
import GameLibrary from '@src/game/libraries/GameLibrary'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import GenericErrorMiddleware from '@src/middleware/GenericErrorMiddleware'
import { printAllRoutes } from '@src/utils/RoutePrinter'
import { colorize, colorizeId } from '@src/utils/Utils'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import expressWs from 'express-ws'
import logger from 'morgan'

import Database from './database/Database'
import AsyncHandler from './utils/AsyncHandler'
import { cardImageGenerator } from './utils/CardImageGenerator'
import { wsLogger } from './utils/WebSocketLogger'

const app = express()
expressWs(app)

import AdminRouter from './routers/AdminRouter'
import CardsRouter from './routers/CardsRouter'
import ChangelogRouter from './routers/ChangelogRouter'
import DecksRouter from './routers/DecksRouter'
import DevRouter from './routers/DevRouter'
import FeedbackRouter from './routers/FeedbackRouter'
import GamesRouter from './routers/GamesRouter'
import HealthRouter from './routers/HealthRouter'
import ModalsRouter from './routers/ModalsRouter'
import OvermindRouter from './routers/overmind/OvermindRouter'
import PlayRouter from './routers/PlayRouter'
import RulesetsRouter from './routers/RulesetsRouter'
import SessionRouter from './routers/SessionRouter'
import StatusRouter from './routers/StatusRouter'
import UserProfileRouter from './routers/UserProfileRouter'
import UserRouter from './routers/UserRouter'
import VersionRouter from './routers/VersionRouter'
import WorkshopRouter from './routers/WorkshopRouter'

/* Templating engine */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

/* Forced HTTPS */
app.use((req: Request, res: Response, next) => {
	if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
		console.debug('Redirecting to HTTPS')
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
app.use(express.static(path.join(ROOT_DIR, 'public')))
app.use(express.static(path.join(ROOT_DIR, 'generated')))
app.use(express.static(path.join(ROOT_DIR, '../../client')))

/* OPTIONS request */
app.use((req: Request, res: Response, next) => {
	if (req.method === 'OPTIONS') {
		res.status(200)
		res.json(JSON.stringify({}))
	} else {
		next()
	}
})

/* Global rate limiting */
app.use(
	'/api/',
	rateLimit({
		windowMs: 15 * 1000,
		max: 150,
	})
)

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
app.use('/api/feedback', FeedbackRouter)
app.use('/api/version', VersionRouter)
app.use('/api/workshop', WorkshopRouter)
app.use('/api/overmind', OvermindRouter)

/* WS routers */
app.use('/api/game', PlayRouter)
app.use('/api/status', StatusRouter)

/* Other routers */
app.use('/health', HealthRouter)

/* Generic error handler */
app.use(GenericErrorMiddleware)

console.info('Registered routes:', printAllRoutes(app))

/* Index fallback */
app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../../client/index.html'))
})

/* Last-resort error handler */
app.use((err: any, req: Request, res: Response, _next: () => void) => {
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

/* Check for orphaned games every hour */
setInterval(async () => {
	GameLibrary.checkOrphanedGames()
}, 60 * 60 * 1000)

const port = process.env.PORT || 3000

DiscordIntegration.getInstance().printStatus()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error(`${colorize('No DATABASE_URL specified. Server will not respond to most requests!', AsciiColor.RED)}`)
} else if (!Database.isReady()) {
	console.info(`Database client status: [${colorize(`CONNECTING`, AsciiColor.YELLOW)}].`)
	console.info(colorize('Gaia will not respond to requests until the DB connection is established.', AsciiColor.YELLOW))
}

console.info(`Starting listening at port ${colorizeId(port)}`)
app.listen(port)
