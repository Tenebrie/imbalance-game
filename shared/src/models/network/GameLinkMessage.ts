import Game from '../Game'
import GameMessage from './GameMessage'

export default class GameLinkMessage {
	game: GameMessage
	suppressEndScreen: boolean

	constructor(game: Game, suppressEndScreen: boolean) {
		this.game = new GameMessage(game)
		this.suppressEndScreen = suppressEndScreen
	}
}
