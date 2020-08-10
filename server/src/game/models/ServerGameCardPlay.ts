import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import CardType from '@shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardResolveStack from './ServerCardResolveStack'
import Utils from '../../utils/Utils'
import GameEventCreators from './GameEventCreators'

export default class ServerGameCardPlay {
	game: ServerGame
	cardResolveStack: ServerCardResolveStack

	constructor(game: ServerGame) {
		this.game = game
		this.cardResolveStack = new ServerCardResolveStack(game)
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/* Deduct mana */
		if (ownedCard.card.type === CardType.UNIT) {
			ownedCard.owner.setUnitMana(ownedCard.owner.unitMana - Math.max(0, ownedCard.card.unitCost))
		} else if (ownedCard.card.type === CardType.SPELL) {
			ownedCard.owner.setSpellMana(ownedCard.owner.spellMana - Math.max(0, ownedCard.card.spellCost))
		}

		/* Resolve card */
		this.forcedPlayCardFromHand(ownedCard, rowIndex, unitIndex)
	}

	public forcedPlayCardFromHand(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	public forcedPlayCardFromDeck(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'deck')
	}

	private forcedPlayCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number, source: 'hand' | 'deck'): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Remember played card */
		owner.addToPlayedCards(card)

		/* Trigger card played event */
		this.game.events.postEvent(GameEventCreators.cardPlayed({
			owner: owner,
			triggeringCard: card,
		}))

		/* Announce card to opponent */
		card.reveal(owner, owner.opponent)
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent.player, ServerAnimation.cardAnnounce(card))

		/* Remove card from source */
		if (source === 'hand' && owner.cardHand.findCardById(card.id)) {
			owner.cardHand.removeCard(card)
		} else if (source === 'deck' && owner.cardDeck.findCardById(card.id)) {
			owner.cardDeck.removeCard(card)
		}

		/* Resolve card */
		if (card.type === CardType.UNIT) {
			this.playUnit(ownedCard, rowIndex, unitIndex)
		} else if (card.type === CardType.SPELL) {
			this.playSpell(ownedCard)
		}

		/* Play animation */
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent.player, ServerAnimation.delay())
	}

	private playUnit(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)

		/* Insert the card into the board */
		const unit = this.game.board.createUnit(card, owner, rowIndex, unitIndex)
		if (unit !== null) {
			/* Invoke the card Deploy effect */
			this.game.events.postEvent(GameEventCreators.unitDeployed({
				triggeringUnit: unit
			}))
		}

		/* Another card has been played and requires targeting. Continue execution later */
		if (this.cardResolveStack.currentCard !== ownedCard) {
			return
		}

		/* Require targets */
		this.checkCardTargeting(ownedCard)
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)

		/* Invoke the card onPlay effect */
		this.game.events.postEvent(GameEventCreators.spellDeployed({
			triggeringCard: card
		}))

		/* Another card has been played and requires targeting. Continue execution later */
		if (this.cardResolveStack.currentCard !== ownedCard) {
			return
		}

		this.checkCardTargeting(ownedCard)
	}

	public checkCardTargeting(ownedCard: ServerOwnedCard): void {
		const validTargets = this.getValidTargets()

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

		const targetDefinition = card.getPostPlayRequiredTargetDefinition()
		if (targetDefinition.getTargetCount() === 0) {
			return []
		}

		const unit = this.game.board.findUnitById(card.id)
		const args = {
			thisUnit: unit,
			thisCardOwner: currentCard.owner
		}

		let validTargets = []
		Utils.forEachInNumericEnum(TargetType, (targetType: TargetType) => {
			validTargets = validTargets.concat(card.getValidTargets(TargetMode.POST_PLAY_REQUIRED_TARGET, targetType, targetDefinition, args, this.cardResolveStack.currentTargets))
		})
		return validTargets
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, target: ServerCardTarget): void {
		if (playerInGame !== this.cardResolveStack.currentCard.owner) {
			return
		}

		const currentResolvingCard = this.cardResolveStack.currentCard

		let validTargets = this.getValidTargets()
		const isValidTarget = !!validTargets.find(validTarget => validTarget.isEqual(target))
		if (!isValidTarget) {
			OutgoingMessageHandlers.notifyAboutResolvingCardTargets(playerInGame.player, validTargets)
			return
		}

		this.cardResolveStack.pushTarget(target)

		this.game.events.postEvent(GameEventCreators.cardTargetSelected({
			triggeringCard: currentResolvingCard.card,
			targetCard: target.targetCard,
			targetUnit: target.targetUnit,
			targetRow: target.targetRow
		}))

		// Current card changed - resolve that first
		if (this.cardResolveStack.currentCard !== currentResolvingCard) {
			return
		}

		validTargets = this.getValidTargets()

		if (validTargets.length > 0) {
			OutgoingMessageHandlers.notifyAboutResolvingCardTargets(playerInGame.player, validTargets)
			return
		}

		this.game.events.postEvent(GameEventCreators.cardTargetsConfirmed({
			triggeringCard: currentResolvingCard.card
		}))
		this.cardResolveStack.finishResolving()
	}
}
