import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCard from './ServerCard'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import runCardEventHandler from '../utils/runCardEventHandler'
import CardType from '../shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardResolveStack from './ServerCardResolveStack'

export default class ServerGameCardPlay {
	game: ServerGame
	cardResolveStack: ServerCardResolveStack

	constructor(game: ServerGame) {
		this.game = game
		this.cardResolveStack = new ServerCardResolveStack(game)
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		this.forcedPlayCardFromHand(ownedCard, rowIndex, unitIndex)

		/* Advance the time */
		ownedCard.owner.setTimeUnits(ownedCard.owner.timeUnits - 1)
	}

	public forcedPlayCardFromHand(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Announce card to opponent */
		card.reveal(owner, owner.opponent)
		OutgoingMessageHandlers.triggerAnimation(owner.opponent.player, ServerAnimation.cardPlay(card))

		/* Remove card from hand */
		if (owner.cardHand.findCardById(card.id)) {
			owner.cardHand.removeCard(card)
		}

		if (card.cardType === CardType.UNIT) {
			this.playUnit(ownedCard, rowIndex, unitIndex)
		} else if (card.cardType === CardType.SPELL) {
			this.playSpell(ownedCard)
		}

		OutgoingMessageHandlers.triggerAnimation(owner.opponent.player, ServerAnimation.delay())
	}

	public forcedPlayCardFromDeck(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Announce card to opponent */
		card.reveal(owner, owner.opponent)
		OutgoingMessageHandlers.triggerAnimation(owner.opponent.player, ServerAnimation.cardPlay(card))

		/* Remove card from hand */
		if (owner.cardDeck.findCardById(card.id)) {
			owner.cardDeck.removeCard(card)
		}

		if (card.cardType === CardType.UNIT) {
			this.playUnit(ownedCard, rowIndex, unitIndex)
		} else if (card.cardType === CardType.SPELL) {
			this.playSpell(ownedCard)
		}

		OutgoingMessageHandlers.triggerAnimation(owner.opponent.player, ServerAnimation.delay())
	}

	private playUnit(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)

		/* Insert the card into the board */
		const targetRow = this.game.board.rows[rowIndex]
		const unit = targetRow.createUnit(card, owner, unitIndex)

		/* Invoke the card onPlay effect */
		runCardEventHandler(() => card.onPlayUnit(unit, targetRow))

		/* Another card has been played and requires targeting. Continue execution later */
		if (this.cardResolveStack.currentCard !== ownedCard) {
			return
		}

		/* Require targets */
		this.checkCardTargeting(ownedCard)
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)

		/* Invoke the card onPlay effect */
		runCardEventHandler(() => card.onPlaySpell(owner))

		/* Another card has been played and requires targeting. Continue execution later */
		if (this.cardResolveStack.currentCard !== ownedCard) {
			return
		}

		this.checkCardTargeting(ownedCard)
	}

	private checkCardTargeting(ownedCard: ServerOwnedCard): void {
		let validTargets = this.getValidTargets()

		if (validTargets.length === 0) {
			this.cardResolveStack.finishResolving()
		} else {
			OutgoingMessageHandlers.notifyAboutResolvingCardTargets(ownedCard.owner.player, validTargets)
		}
	}

	public getValidTargets(): ServerCardTarget[] {
		if (!this.cardResolveStack.hasCards()) {
			return []
		}
		const currentCard = this.cardResolveStack.currentCard
		const card = currentCard.card

		const targetDefinition = card.getPlayRequiredTargetDefinition()
		if (targetDefinition.getTargetCount() === 0) {
			return []
		}

		const unit = this.game.board.findUnitById(card.id)
		const args = {
			thisUnit: unit,
			thisCardOwner: currentCard.owner
		}

		return []
			.concat(card.getValidTargets(TargetMode.ON_PLAY, TargetType.UNIT, targetDefinition, args, this.cardResolveStack.currentTargets))
			.concat(card.getValidTargets(TargetMode.ON_PLAY, TargetType.BOARD_ROW, targetDefinition, args, this.cardResolveStack.currentTargets))
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, target: ServerCardTarget): void {
		if (playerInGame !== this.cardResolveStack.currentCard.owner) {
			return
		}

		let validTargets = this.getValidTargets()
		const isValidTarget = !!validTargets.find(validTarget => validTarget.isEqual(target))
		if (!isValidTarget) {
			OutgoingMessageHandlers.notifyAboutResolvingCardTargets(playerInGame.player, validTargets)
			return
		}

		const sourceUnit = target.sourceUnit
		const sourceCard = target.sourceCard || sourceUnit.card

		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetCard) {
			sourceCard.onUnitPlayTargetCardSelected(sourceUnit, target.targetCard)
		}
		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetUnit) {
			sourceCard.onUnitPlayTargetUnitSelected(sourceUnit, target.targetUnit)
		}
		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetRow) {
			sourceCard.onUnitPlayTargetRowSelected(sourceUnit, target.targetRow)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetCard) {
			sourceCard.onSpellPlayTargetCardSelected(playerInGame, target.targetCard)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetUnit) {
			sourceCard.onSpellPlayTargetUnitSelected(playerInGame, target.targetUnit)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetRow) {
			sourceCard.onSpellPlayTargetRowSelected(playerInGame, target.targetRow)
		}
		this.cardResolveStack.pushTarget(target)

		validTargets = this.getValidTargets()

		if (validTargets.length > 0) {
			OutgoingMessageHandlers.notifyAboutResolvingCardTargets(playerInGame.player, validTargets)
			return
		}

		if (sourceCard.cardType === CardType.UNIT) {
			sourceCard.onUnitPlayTargetsConfirmed(sourceUnit)
		} else if (sourceCard.cardType === CardType.SPELL) {
			sourceCard.onSpellPlayTargetsConfirmed(playerInGame)
		}
		this.cardResolveStack.finishResolving()

		if (this.cardResolveStack.currentCard) {
			this.checkCardTargeting(this.cardResolveStack.currentCard)
		}
	}
}
