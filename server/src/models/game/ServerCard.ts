import uuidv4 from 'uuid/v4'
import Card from '../../shared/models/Card'
import CardType from '../../shared/enums/CardType'
import ServerGame from '../../libraries/game/ServerGame'
import runCardEventHandler from '../../utils/runCardEventHandler'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false

	constructor(game: ServerGame, cardType: CardType, cardClass: string) {
		super(uuidv4(), cardType, cardClass)
		this.game = game
	}

	setAttack(unit: ServerCardOnBoard, value: number): void {
		if (this.attack === value) { return }

		this.attack = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardAttackChange(playerInGame.player, this)
		})
	}

	setHealth(unit: ServerCardOnBoard, value: number): void {
		if (this.health === value) { return }

		this.health = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardHealthChange(playerInGame.player, this)
		})
	}

	setInitiative(unit: ServerCardOnBoard, value: number): void {
		if (this.initiative === value) { return }

		runCardEventHandler(() => this.onInitiativeChanged(unit, value, this.initiative))

		this.initiative = value

		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardInitiativeChange(playerInGame.player, this)
		})
	}

	reveal(owner: ServerPlayerInGame, opponent: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		runCardEventHandler(() => this.onReveal(owner))
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void { return }
	onPlaySpell(owner: ServerPlayerInGame): void { return }
	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void { return }
	onInitiativeChanged(thisUnit: ServerCardOnBoard, newValue: number, oldValue: number): void { return }
	onBeforeDamageTaken(thisUnit: ServerCardOnBoard, damage: number): void { return }
	onAfterDamageTaken(thisUnit: ServerCardOnBoard, damage: number): void { return }
	onDamageSurvived(thisUnit: ServerCardOnBoard, damage: number): void { return }
	onBeforePerformingAttack(thisUnit: ServerCardOnBoard): void { return }
	onAfterPerformingAttack(thisUnit: ServerCardOnBoard): void { return }
	onBeforeBeingAttacked(thisUnit: ServerCardOnBoard): void { return }
	onAfterBeingAttacked(thisUnit: ServerCardOnBoard): void { return }
	onBeforeOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void { return }
	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void { return }
	onReveal(owner: ServerPlayerInGame): void { return }
	onDestroyUnit(thisUnit: ServerCardOnBoard): void { return }
}
