import uuidv4 from 'uuid/v4'
import Card from '../../shared/models/Card'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerCard extends Card {
	isRevealed = false

	constructor(cardClass: string) {
		super(uuidv4(), cardClass)
	}

	reveal(game: ServerGame, activePlayer: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		this.onReveal(game, activePlayer)
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(activePlayer.player, this)
	}

	onPlay(game: ServerGame, activePlayer: ServerPlayerInGame): void { return }
	onReveal(game: ServerGame, activePlayer: ServerPlayerInGame): void { return }

	static newInstance(cardClass: string): ServerCard {
		return new ServerCard(cardClass)
	}
}
