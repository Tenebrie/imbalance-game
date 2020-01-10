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
		this.onBeforeDamageTaken(game, owner, damage)
		this.health -= damage
		this.onAfterDamageTaken(game, owner, damage)
		game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardHealthChange(playerInGame.player, this)
		})
		if (this.health <= 0) {
			this.destroy(game, owner)
		} else {
			this.onDamageSurvived(game, owner, damage)
		}
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
		game.board.removeCardById(this.id)
		game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, this)
		})
	}

	onPlayUnit(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onPlaySpell(game: ServerGame, owner: ServerPlayerInGame): void { return }
	onBeforeDamageTaken(game: ServerGame, owner: ServerPlayerInGame, damage: number): void { return }
	onAfterDamageTaken(game: ServerGame, owner: ServerPlayerInGame, damage: number): void { return }
	onDamageSurvived(game: ServerGame, owner: ServerPlayerInGame, damage: number): void { return }
	onBeforePerformingAttack(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onAfterPerformingAttack(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onBeforeBeingAttacked(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onAfterBeingAttacked(game: ServerGame, cardOnBoard: ServerCardOnBoard): void { return }
	onReveal(game: ServerGame, owner: ServerPlayerInGame): void { return }
	onDestroy(game: ServerGame, owner: ServerPlayerInGame): void { return }

	static newInstance(cardType: CardType, cardClass: string): ServerCard {
		return new ServerCard(cardType, cardClass)
	}
}
