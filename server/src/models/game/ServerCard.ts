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

	dealDamage(game: ServerGame, owner: ServerPlayerInGame, damage: number): void {
		this.onBeforeDamage(game, owner, damage)
		this.health -= damage
		this.onAfterDamage(game, owner, damage)
		game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardHealthChange(playerInGame.player, this)
		})
	}

	setInitiative(game: ServerGame, owner: ServerPlayerInGame, value: number): void {
		if (this.initiative === value) { return }

		this.initiative = value
		game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardInitiativeChange(playerInGame.player, this)
		})
	}

	reveal(game: ServerGame, owner: ServerPlayerInGame, opponent: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		this.onReveal(game, owner)
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	destroy(game: ServerGame, owner: ServerPlayerInGame): void {
		this.onDestroy(game, owner)
		game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, this)
		})
	}

	onPlayUnit(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onPlaySpell(game: ServerGame, owner: ServerPlayerInGame): void { return }
	onBeforeDamage(game: ServerGame, owner: ServerPlayerInGame, damage: number): void { return }
	onAfterDamage(game: ServerGame, owner: ServerPlayerInGame, damage: number): void { return }
	onReveal(game: ServerGame, owner: ServerPlayerInGame): void { return }
	onDestroy(game: ServerGame, owner: ServerPlayerInGame): void { return }

	static newInstance(cardType: CardType, cardClass: string): ServerCard {
		return new ServerCard(cardType, cardClass)
	}
}
