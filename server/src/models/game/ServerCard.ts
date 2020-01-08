import uuidv4 from 'uuid/v4'
import Card from '../../shared/models/Card'
import CardType from '../../shared/enums/CardType'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerCard extends Card {
	isRevealed = false

	constructor(cardType: CardType, cardClass: string) {
		super(uuidv4(), cardType, cardClass)
	}

	reveal(game: ServerGame, owner: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		this.onReveal(game, owner)
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(owner.player, this)
	}

	onPlayUnit(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onPlaySpell(game: ServerGame, owner: ServerPlayerInGame): void { return }
	onReveal(game: ServerGame, owner: ServerPlayerInGame): void { return }

	static newInstance(cardType: CardType, cardClass: string): ServerCard {
		return new ServerCard(cardType, cardClass)
	}
}
