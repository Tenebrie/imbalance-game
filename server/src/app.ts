import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import 'module-alias/register'

import express, { Request, Response } from 'express'
import expressWs from 'express-ws'

import Database from './database/Database'
import CardLibrary from './game/libraries/CardLibrary'
import GameLibrary from './game/libraries/GameLibrary'
import PlayerLibrary from './game/players/PlayerLibrary'

const app = express()
expressWs(app)

/* Routers must be imported after express-ws is initialized, therefore 'require' syntax */
const StatusRouter = require('./routers/StatusRouter')
const ChangelogRouter = require('./routers/ChangelogRouter')

const PlayRouter = require('./routers/PlayRouter')
const LoginRouter = require('./routers/LoginRouter')
const CardsRouter = require('./routers/CardsRouter')
const DecksRouter = require('./routers/DecksRouter')
const GamesRouter = require('./routers/GamesRouter')
const LogoutRouter = require('./routers/LogoutRouter')
const ProfileRouter = require('./routers/ProfileRouter')
const RegisterRouter = require('./routers/RegisterRouter')

/* Templating engine */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

/* Forced HTTPS */
app.use((req: Request, res: Response, next) => {
	if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
		return res.redirect('https://' + req.get('host') + req.url)
	}
	next()
})

/* Random middleware */
app.use(logger('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../../../public')))
app.use(express.static(path.join(__dirname, '../../../client')))

/* OPTIONS request */
app.use((req: Request, res: Response, next) => {
	if (req.method === 'OPTIONS') {
		res.status(200)
		res.json(JSON.stringify({}))
	} else {
		next()
	}
})

/* Page HTTP routers */
app.use('/status', StatusRouter)
app.use('/changelog', ChangelogRouter)

/* API HTTP routers */
app.use('/api/cards', CardsRouter)
app.use('/api/decks', DecksRouter)
app.use('/api/games', GamesRouter)
app.use('/api/login', LoginRouter)
app.use('/api/logout', LogoutRouter)
app.use('/api/profile', ProfileRouter)
app.use('/api/register', RegisterRouter)

/* WS routers */
app.use('/api/game', PlayRouter)

/* Index fallback */
app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../../client/index.html'))
})

/* Global error handler */
app.use((err, req, res, next) => {
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: req.app.get('env') === 'development' ? err : {}
	})
})

/* Global state */
Database.init()
global.cardLibrary = new CardLibrary()
global.gameLibrary = new GameLibrary()
global.playerLibrary = new PlayerLibrary()

app.listen((process.env.PORT || 3000))
