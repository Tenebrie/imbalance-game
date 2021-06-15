import express, { Response } from 'express'
import AsyncHandler from '../utils/AsyncHandler'
import TokenManager from '../services/TokenService'
import PlayerLibrary from '../game/players/PlayerLibrary'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'
import { clearCookie, setCookie } from '../utils/Utils'
import RequirePlayerTokenMiddleware from '@src/middleware/RequirePlayerTokenMiddleware'
import StartingDecks from '@src/game/utils/StartingDecks'
import EditorDeckDatabase from '@src/database/EditorDeckDatabase'

const router = express.Router()

/* Login endpoint. Does not require user token */
router.post(
	'/',
	AsyncHandler(async (req, res: Response) => {
		const email = req.body['email']
		const password = req.body['password']
		if (!email || !password) {
			throw { status: 400, code: UserLoginErrorCode.MISSING_CREDENTIALS, error: 'Missing username or password' }
		}

		const player = await PlayerLibrary.login(email, password)
		if (!player) {
			throw { status: 400, code: UserLoginErrorCode.INVALID_CREDENTIALS, error: 'Username or password invalid' }
		}

		const playerToken = TokenManager.generateJwtToken(player)
		setCookie(res, 'playerToken', playerToken)
		res.json({ data: new OpenPlayerMessage(player) })
	})
)

/* Guest login endpoint. Does not require user token */
router.post(
	'/guest',
	AsyncHandler(async (req, res: Response) => {
		// Insert the user
		const guestRandomIndex = Math.floor(Math.random() * 90000) + 10000
		const email = `guest-${guestRandomIndex}@localhost`
		const success = await PlayerLibrary.registerGuest(email, 'Guest')
		if (!success) {
			throw { status: 500, error: 'General database error' }
		}

		// Insert the starting deck
		const player = await PlayerLibrary.loginWithoutPassword(email)
		if (!player) {
			throw { status: 500, error: 'General database error' }
		}
		await Promise.all(
			StartingDecks.getStartingDecks().map((startingDeck) => {
				return EditorDeckDatabase.insertEditorDeck(player, startingDeck)
			})
		)

		const playerToken = TokenManager.generateJwtToken(player)
		setCookie(res, 'playerToken', playerToken)
		res.json({ data: new OpenPlayerMessage(player) })
	})
)

router.use(RequirePlayerTokenMiddleware)

router.delete(
	'/',
	AsyncHandler(async (req, res: Response) => {
		// TODO: Disconnect the player and close the socket, if open
		const originalToken = req.cookies['originalPlayerToken']
		if (originalToken) {
			setCookie(res, 'playerToken', originalToken)
			clearCookie(res, 'originalPlayerToken', '')
		} else {
			clearCookie(res, 'playerToken', '')
		}

		res.json({
			success: true,
			stillAuthenticated: !!originalToken,
		})
	})
)

module.exports = router
