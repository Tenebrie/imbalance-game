import 'source-map-support/register'
import 'module-alias/register'

import { colorizeId } from '@src/utils/Utils'
import * as tf from '@tensorflow/tfjs-node'
import axios from 'axios'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import expressWs from 'express-ws'
import logger from 'morgan'
import storage from 'node-persist'

import { createInitialPopulation, createNewPopulation } from './evolution/evolution'
import { convertToInGameAgent, InGameAgent, StorageAgent } from './models/agent'
import { shuffleHandCards } from './models/prepareInput'
import { wsLogger } from './utils/WebSocketLogger'

let inMemoryStorage: InGameAgent[] = []

storage.init()

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

app.get('/runGames', async (req, res) => {
	const rawAgents = (await storage.get('population')) as StorageAgent[] | undefined
	let agents: InGameAgent[]
	if (!rawAgents) {
		agents = await createInitialPopulation(10)
	} else {
		agents = rawAgents.map(convertToInGameAgent)
	}

	inMemoryStorage = agents

	const games = agents.flatMap((player1) =>
		agents.map((player2) => {
			const game = {
				firstAgent: player1.id,
				secondAgent: player2.id,
			}
			return game
		})
	)

	const response = await axios.post(process.env.GAME_SERVER + '/api/overmind/simulate', { data: games })
	response.data.forEach((winner: string) => {
		if (winner === 'draw') {
			return
		}
		inMemoryStorage.find((a) => a.id === winner)!.score++
	})

	const newPopulation = await createNewPopulation(inMemoryStorage)
	await storage.set('population', newPopulation)

	res.json(inMemoryStorage.sort((agent0, agent1) => agent1.score - agent0.score))
})

app.post('/move/:agentId', async (req, res) => {
	const [backMap, cards] = shuffleHandCards(req.body.allCardsInHand)
	const agentId = req.params.agentId as '1'
	const data = await ((inMemoryStorage
		.find((a) => a.id === agentId)!
		.model.apply(
			tf.tensor([[...cards.flat(), ...req.body.alliedUnits.flat(), ...req.body.enemyUnits.flat()]])
		) as unknown) as tf.Tensor).data()

	const result = [...data]
		.map((datum, index) => ({ datum, cardId: backMap[index] }))
		.filter((value) => !!value.cardId)
		.sort((a, b) => b.datum - a.datum)
		.filter((value) => req.body.playableCards.includes(value.cardId))

	res.send(result[0].cardId)
})

const port = process.env.PORT || 3001
console.info(`Starting listening at port ${colorizeId(port)}`)
app.listen(port)
