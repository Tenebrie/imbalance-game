import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCardTarget from './ServerCardTarget'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import CardType from '@shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerResolveStack from './ServerResolveStack'
import GameEventCreators from './GameEventCreators'
import Utils from '../../utils/Utils'
import TargetMode from '@shared/enums/TargetMode'

export default class ServerGameCardPlay {
	game: ServerGame
	cardResolveStack: ServerResolveStack

	constructor(game: ServerGame) {
		this.game = game
		this.cardResolveStack = new ServerResolveStack(game)
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/* Deduct mana */
		if (ownedCard.card.type === CardType.UNIT) {
			ownedCard.owner.setUnitMana(ownedCard.owner.unitMana - Math.max(0, ownedCard.card.stats.unitCost))
		} else if (ownedCard.card.type === CardType.SPELL) {
			ownedCard.owner.setSpellMana(ownedCard.owner.spellMana - Math.max(0, ownedCard.card.stats.spellCost))
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
			OutgoingMessageHandlers.notifyAboutPopupTargets(ownedCard.owner.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))
		}
	}

	public getValidTargets(): ServerCardTarget[] {
		if (!this.cardResolveStack.hasCards()) {
			return []
		}
		const currentCard = this.cardResolveStack.currentCard
		const card = currentCard.card

		return card.targeting.getDeployEffectTargets(this.cardResolveStack.currentTargets)
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, target: ServerCardTarget): void {
		const currentResolvingCard = this.cardResolveStack.currentCard

		let validTargets: ServerCardTarget[] = this.getValidTargets()
		const isValidTarget = !!validTargets.find(validTarget => validTarget.isEqual(target))
		if (!isValidTarget) {
			OutgoingMessageHandlers.notifyAboutPopupTargets(playerInGame.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))
			return
		}

		this.cardResolveStack.pushTarget(target)

		this.game.events.postEvent(GameEventCreators.cardTargetSelected({
			targetMode: target.targetMode,
			targetType: target.targetType,
			triggeringCard: currentResolvingCard.card,
			triggeringPlayer: playerInGame,
			targetCard: target.targetCard,
			targetUnit: target.targetCard?.unit,
			targetRow: target.targetRow
		}))

		// Current card changed - resolve that first
		if (this.cardResolveStack.currentCard !== currentResolvingCard) {
			return
		}

		validTargets = this.getValidTargets()

		if (validTargets.length > 0) {
			OutgoingMessageHandlers.notifyAboutPopupTargets(playerInGame.player,TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))
			return
		}

		this.game.events.postEvent(GameEventCreators.cardTargetsConfirmed({
			triggeringCard: currentResolvingCard?.card,
			triggeringPlayer: playerInGame,
		}))
		this.cardResolveStack.finishResolving()
	}

	public selectPlayerMulliganTarget(playerInGame: ServerPlayerInGame, target: ServerCardTarget): void {
		this.cardResolveStack.pushTarget(target)

		this.game.events.postEvent(GameEventCreators.playerTargetSelected({
			targetMode: target.targetMode,
			targetType: target.targetType,
			triggeringPlayer: playerInGame,
			targetCard: target.targetCard,
			targetUnit: target.targetCard?.unit,
			targetRow: target.targetRow
		}))

		const validTargets = this.getValidTargets()

		if (validTargets.length > 0) {
			OutgoingMessageHandlers.notifyAboutPopupTargets(playerInGame.player, TargetMode.MULLIGAN, Utils.shuffle(validTargets))
			return
		}
	}
}
